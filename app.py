from __future__ import annotations

import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from flask import Flask, jsonify, request, send_from_directory, session
from psycopg.errors import UndefinedColumn, UndefinedTable
import psycopg
from psycopg.rows import dict_row

APP_ROOT = Path(__file__).resolve().parent
SCHEMA_PATH = APP_ROOT / 'database' / 'schema.sql'

app = Flask(__name__, static_folder=None)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'travel-agency-dev-secret')


def db_connection() -> psycopg.Connection:
    return psycopg.connect(
        host=os.getenv('PGHOST', '127.0.0.1'),
        port=os.getenv('PGPORT', '5432'),
        dbname=os.getenv('PGDATABASE', 'travel_agency'),
        user=os.getenv('PGUSER', 'postgres'),
        password=os.getenv('PGPASSWORD', 'postgres'),
        row_factory=dict_row,
    )


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def initialize_database() -> None:
    with db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(SCHEMA_PATH.read_text(encoding='utf-8'))
            ensure_schema(cur)
            cur.execute('SELECT COUNT(*) AS count FROM tours')
            tours_count = int(cur.fetchone()['count'])
            if tours_count == 0:
                seed_tours(cur)
        conn.commit()


def ensure_schema(cur: psycopg.Cursor[Any]) -> None:
    cur.execute("ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS phone VARCHAR(50) DEFAULT ''")
    cur.execute("ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS password_hash TEXT DEFAULT NULL")
    cur.execute("ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS provider VARCHAR(50) NOT NULL DEFAULT 'local'")
    cur.execute("ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP")

    cur.execute("ALTER TABLE IF EXISTS tours ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP")

    cur.execute("ALTER TABLE IF EXISTS bookings ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT ''")
    cur.execute("ALTER TABLE IF EXISTS bookings ADD COLUMN IF NOT EXISTS status VARCHAR(100) NOT NULL DEFAULT '\u041d\u043e\u0432\u0430 \u0437\u0430\u044f\u0432\u043a\u0430'")
    cur.execute("ALTER TABLE IF EXISTS bookings ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP")

    cur.execute("ALTER TABLE IF EXISTS messages ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP")


def seed_tours(cur: psycopg.Cursor[Any]) -> None:
    tours = [
        ('Ретимнон, Греція', 'Греція', 'Ретимнон', 300, 8, 'Подорож до сонячного узбережжя Криту з прогулянками старим містом та відпочинком біля моря.', 'destination-1.jpg'),
        ('Балі, Індонезія', 'Індонезія', 'Балі', 300, 10, 'Екзотичний тур з океаном, храмами та релаксом на острові Балі.', 'destination-2.jpg'),
        ('Оттава, Канада', 'Канада', 'Оттава', 300, 7, 'Міська подорож до столиці Канади з культурною програмою та екскурсіями.', 'destination-3.jpg'),
        ('Сінгапур', 'Сінгапур', 'Сінгапур', 450, 6, 'Сучасний мегаполіс, футуристичні сади та гастрономічні враження.', 'place-1.jpg'),
        ('Канада Nature', 'Канада', 'Ванкувер', 520, 9, 'Поєднання міських локацій і природних парків Канади.', 'place-2.jpg'),
        ('Таїланд Escape', 'Таїланд', 'Пхукет', 390, 8, 'Тропічний відпочинок біля моря з острівними турами.', 'place-3.jpg'),
    ]
    cur.executemany(
        '''
        INSERT INTO tours (title, country, city, price, duration_days, description, image, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ''',
        [(title, country, city, price, duration_days, description, image, utc_now()) for title, country, city, price, duration_days, description, image in tours],
    )


def json_response(payload: dict[str, Any], status: int = 200):
    return jsonify(payload), status


def request_data() -> dict[str, Any]:
    if request.is_json:
        return request.get_json(silent=True) or {}
    return request.form.to_dict()


def current_user() -> dict[str, Any] | None:
    user_id = session.get('user_id')
    if not user_id:
        return None

    with db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                'SELECT id, name, phone, email, provider, created_at FROM users WHERE id = %s LIMIT 1',
                (user_id,),
            )
            user = cur.fetchone()
            if not user:
                session.pop('user_id', None)
                return None
            return user


def require_auth() -> dict[str, Any]:
    user = current_user()
    if not user:
        raise PermissionError('Щоб продовжити, увійдіть у свій акаунт.')
    return user


def find_user_by_email(email: str) -> dict[str, Any] | None:
    normalized = email.strip().lower()
    with db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute('SELECT * FROM users WHERE email = %s LIMIT 1', (normalized,))
            return cur.fetchone()


def sign_in(user: dict[str, Any]) -> None:
    session['user_id'] = int(user['id'])


@app.errorhandler(PermissionError)
def handle_permission_error(error: PermissionError):
    return json_response({'ok': False, 'message': str(error)}, 401)


@app.errorhandler(Exception)
def handle_unexpected_error(error: Exception):
    if request.path.startswith('/api/'):
        app.logger.exception('API error on %s', request.path)
        return json_response({'ok': False, 'message': '\u041d\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0456 \u0441\u0442\u0430\u043b\u0430\u0441\u044f \u043f\u043e\u043c\u0438\u043b\u043a\u0430. \u041f\u0435\u0440\u0435\u0432\u0456\u0440\u0442\u0435 \u0441\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u0443 \u0431\u0430\u0437\u0438 \u0434\u0430\u043d\u0438\u0445 \u0456 \u0441\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0449\u0435 \u0440\u0430\u0437.'}, 500)
    raise error


@app.get('/api/auth/status')
def auth_status():
    return json_response({'ok': True, 'user': current_user()})


@app.post('/api/auth')
def auth_action():
    data = request_data()
    action = data.get('action', '')

    if action == 'logout':
        session.pop('user_id', None)
        return json_response({'ok': True, 'message': 'Ви вийшли з акаунта.'})

    if action == 'register':
        name = data.get('name', '').strip()
        phone = data.get('phone', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        password_confirm = data.get('passwordConfirm', '')
        policy = str(data.get('policy', 'false')).lower() == 'true'

        if not all([name, phone, email, password, password_confirm]):
            return json_response({'ok': False, 'message': 'Будь ласка, заповніть усі поля для реєстрації.'}, 422)
        if '@' not in email:
            return json_response({'ok': False, 'message': 'Введіть коректний email.'}, 422)
        if len(password) < 6:
            return json_response({'ok': False, 'message': 'Пароль має містити щонайменше 6 символів.'}, 422)
        if password != password_confirm:
            return json_response({'ok': False, 'message': 'Паролі не співпадають.'}, 422)
        if not policy:
            return json_response({'ok': False, 'message': 'Потрібно погодитися на обробку персональних даних.'}, 422)
        if find_user_by_email(email):
            return json_response({'ok': False, 'message': 'Акаунт з таким email уже існує.'}, 409)

        from werkzeug.security import generate_password_hash

        with db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    '''
                    INSERT INTO users (name, phone, email, password_hash, provider, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING id, name, phone, email, provider, created_at
                    ''',
                    (name, phone, email, generate_password_hash(password), 'local', utc_now()),
                )
                user = cur.fetchone()
            conn.commit()

        sign_in(user)
        return json_response({'ok': True, 'message': 'Акаунт створено успішно.', 'user': current_user()})

    if action == 'login':
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        if not email or not password:
            return json_response({'ok': False, 'message': 'Вкажіть email і пароль.'}, 422)

        user = find_user_by_email(email)
        if not user:
            return json_response({'ok': False, 'message': 'Користувача з таким email не знайдено.'}, 404)
        if user.get('provider') == 'google':
            return json_response({'ok': False, 'message': 'Для цього акаунта використайте вхід через Google.'}, 409)

        from werkzeug.security import check_password_hash

        if not check_password_hash(user.get('password_hash') or '', password):
            return json_response({'ok': False, 'message': 'Неправильний пароль.'}, 401)

        sign_in(user)
        return json_response({'ok': True, 'message': 'Вхід виконано успішно.', 'user': current_user()})

    if action == 'google':
        email = data.get('email', '').strip().lower()
        if '@' not in email:
            return json_response({'ok': False, 'message': 'Вкажіть коректний Google email.'}, 422)

        user = find_user_by_email(email)
        if not user:
            display_name = email.split('@', 1)[0].replace('.', ' ').replace('_', ' ').replace('-', ' ').title() or 'Google User'
            with db_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        '''
                        INSERT INTO users (name, phone, email, password_hash, provider, created_at)
                        VALUES (%s, %s, %s, %s, %s, %s)
                        RETURNING id, name, phone, email, provider, created_at
                        ''',
                        (display_name, '', email, None, 'google', utc_now()),
                    )
                    user = cur.fetchone()
                conn.commit()

        sign_in(user)
        return json_response({'ok': True, 'message': 'Вхід через Google виконано успішно.', 'user': current_user()})

    return json_response({'ok': False, 'message': 'Невідома дія авторизації.'}, 400)


@app.route('/api/bookings', methods=['GET', 'POST'])
def bookings_api():
    user = require_auth()

    if request.method == 'GET':
        with db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    '''
                    SELECT b.id, b.date_from, b.people_count, b.notes, b.status, b.created_at,
                           t.title, t.country, t.city, t.price, t.duration_days, t.image
                    FROM bookings b
                    JOIN tours t ON t.id = b.tour_id
                    WHERE b.user_id = %s
                    ORDER BY b.created_at DESC
                    ''',
                    (user['id'],),
                )
                bookings = cur.fetchall()
        return json_response({'ok': True, 'bookings': bookings})

    data = request_data()
    tour_id = int(data.get('tour_id', 0) or 0)
    date_from = data.get('date_from', '').strip()
    people_count = max(1, int(data.get('people_count', 1) or 1))
    notes = data.get('notes', '').strip()

    if tour_id <= 0 or not date_from:
        return json_response({'ok': False, 'message': 'Вкажіть тур і дату поїздки.'}, 422)

    with db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute('SELECT id FROM tours WHERE id = %s LIMIT 1', (tour_id,))
            tour = cur.fetchone()
            if not tour:
                return json_response({'ok': False, 'message': 'Обраний тур не знайдено.'}, 404)

            cur.execute(
                '''
                INSERT INTO bookings (user_id, tour_id, date_from, people_count, notes, status, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ''',
                (user['id'], tour_id, date_from, people_count, notes, 'Нова заявка', utc_now()),
            )
        conn.commit()

    return json_response({'ok': True, 'message': 'Бронювання створено успішно. Воно вже доступне у вашому кабінеті.'})


@app.get('/api/profile')
def profile_api():
    user = require_auth()
    with db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute('SELECT COUNT(*) AS count FROM bookings WHERE user_id = %s', (user['id'],))
            total_bookings = int(cur.fetchone()['count'])
            cur.execute('SELECT MAX(created_at) AS last_booking_at FROM bookings WHERE user_id = %s', (user['id'],))
            last_booking_at = cur.fetchone()['last_booking_at']

    return json_response({
        'ok': True,
        'user': user,
        'stats': {
            'total_bookings': total_bookings,
            'last_booking_at': last_booking_at,
        },
    })


@app.post('/api/contact')
def contact_api():
    data = request_data()
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    subject = data.get('subject', '').strip()
    message = data.get('message', '').strip()

    if not all([name, email, subject, message]):
        return json_response({'ok': False, 'message': 'Будь ласка, заповніть усі поля форми зворотного зв’язку.'}, 422)
    if '@' not in email:
        return json_response({'ok': False, 'message': 'Введіть коректний email.'}, 422)

    with db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                'INSERT INTO messages (name, email, subject, message, created_at) VALUES (%s, %s, %s, %s, %s)',
                (name, email, subject, message, utc_now()),
            )
        conn.commit()

    return json_response({'ok': True, 'message': 'Повідомлення збережено успішно.'})


@app.get('/api/tours')
def tours_api():
    with db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute('SELECT id, title, country, city, price, duration_days, description, image FROM tours ORDER BY id ASC')
            tours = cur.fetchall()
    return json_response({'ok': True, 'tours': tours})


@app.get('/')
def root_index():
    return send_from_directory(APP_ROOT, 'index.html')


@app.route('/<path:path>')
def static_proxy(path: str):
    target = APP_ROOT / path
    if target.is_file():
        return send_from_directory(APP_ROOT, path)
    return send_from_directory(APP_ROOT, 'index.html')


if __name__ == '__main__':
    initialize_database()
    app.run(host='127.0.0.1', port=5000, debug=True)
