from __future__ import annotations

import decimal
import os
import secrets
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any

from flask import Flask, jsonify, request, send_from_directory, session
import psycopg
from psycopg.rows import dict_row

APP_ROOT = Path(__file__).resolve().parent
SCHEMA_PATH = APP_ROOT / 'database' / 'schema.sql'

app = Flask(__name__, static_folder=None)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'travel-agency-dev-secret')
ADMIN_EMAIL = os.getenv('ADMIN_EMAIL', 'manager@travelagency.local').strip().lower()
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'Manager2026!')
ADMIN_NAME = os.getenv('ADMIN_NAME', 'Менеджер системи').strip()

SEED_TOURS = [
    {
        'route_code': 'GR-RET-01',
        'title': 'Rethymno, Greece',
        'country': 'Greece',
        'city': 'Rethymno',
        'price': 320,
        'duration_days': 8,
        'description': 'Sea holiday on Crete with guided city walks and relaxed beach days.',
        'image': 'destination-1.jpg',
        'departure_city': 'Vinnytsia',
        'departure_date': '2026-06-18',
        'transport': 'Flight + transfer',
        'seats_total': 18,
    },
    {
        'route_code': 'ID-BAL-02',
        'title': 'Bali, Indonesia',
        'country': 'Indonesia',
        'city': 'Bali',
        'price': 540,
        'duration_days': 10,
        'description': 'Ocean views, temples, rice terraces and a full tropical escape.',
        'image': 'destination-2.jpg',
        'departure_city': 'Kyiv',
        'departure_date': '2026-07-05',
        'transport': 'Flight',
        'seats_total': 14,
    },
    {
        'route_code': 'CA-OTT-03',
        'title': 'Ottawa, Canada',
        'country': 'Canada',
        'city': 'Ottawa',
        'price': 410,
        'duration_days': 7,
        'description': 'A cultural city route with museums, architecture and evening river walks.',
        'image': 'destination-3.jpg',
        'departure_city': 'Lviv',
        'departure_date': '2026-07-22',
        'transport': 'Flight',
        'seats_total': 20,
    },
    {
        'route_code': 'AU-SYD-04',
        'title': 'Sydney, Australia',
        'country': 'Australia',
        'city': 'Sydney',
        'price': 880,
        'duration_days': 11,
        'description': 'An energetic route with iconic beaches, harbor views and city highlights.',
        'image': 'destination-4.jpg',
        'departure_city': 'Kyiv',
        'departure_date': '2026-08-12',
        'transport': 'Flight',
        'seats_total': 12,
    },
    {
        'route_code': 'JP-TYO-05',
        'title': 'Tokyo, Japan',
        'country': 'Japan',
        'city': 'Tokyo',
        'price': 760,
        'duration_days': 9,
        'description': 'Modern districts, traditional temples and food tours in one balanced route.',
        'image': 'destination-5.jpg',
        'departure_city': 'Warsaw',
        'departure_date': '2026-09-03',
        'transport': 'Flight',
        'seats_total': 16,
    },
    {
        'route_code': 'ES-BCN-06',
        'title': 'Barcelona, Spain',
        'country': 'Spain',
        'city': 'Barcelona',
        'price': 360,
        'duration_days': 6,
        'description': 'Mediterranean energy, architecture tours and evenings by the sea.',
        'image': 'destination-6.jpg',
        'departure_city': 'Vinnytsia',
        'departure_date': '2026-06-28',
        'transport': 'Bus + flight',
        'seats_total': 22,
    },
    {
        'route_code': 'IT-ROM-07',
        'title': 'Rome, Italy',
        'country': 'Italy',
        'city': 'Rome',
        'price': 390,
        'duration_days': 5,
        'description': 'Classic Rome route with ancient landmarks, Vatican museums and relaxed evening walks.',
        'image': 'destination-7.jpg',
        'departure_city': 'Lviv',
        'departure_date': '2026-06-22',
        'transport': 'Bus + flight',
        'seats_total': 24,
    },
    {
        'route_code': 'FR-PAR-08',
        'title': 'Paris, France',
        'country': 'France',
        'city': 'Paris',
        'price': 520,
        'duration_days': 6,
        'description': 'Museums, city panoramas, Seine walks and a balanced program for first-time visitors.',
        'image': 'destination-8.jpg',
        'departure_city': 'Kyiv',
        'departure_date': '2026-07-14',
        'transport': 'Flight',
        'seats_total': 18,
    },
    {
        'route_code': 'TR-IST-09',
        'title': 'Istanbul, Turkey',
        'country': 'Turkey',
        'city': 'Istanbul',
        'price': 280,
        'duration_days': 4,
        'description': 'A compact city break with Bosphorus views, old bazaars and historic districts.',
        'image': 'destination-9.jpg',
        'departure_city': 'Odesa',
        'departure_date': '2026-06-12',
        'transport': 'Bus',
        'seats_total': 32,
    },
    {
        'route_code': 'CZ-PRG-10',
        'title': 'Prague, Czech Republic',
        'country': 'Czech Republic',
        'city': 'Prague',
        'price': 250,
        'duration_days': 4,
        'description': 'Weekend route through the old town, castles, viewpoints and cozy evening streets.',
        'image': 'destination-10.jpg',
        'departure_city': 'Vinnytsia',
        'departure_date': '2026-06-05',
        'transport': 'Bus',
        'seats_total': 36,
    },
    {
        'route_code': 'AT-VIE-11',
        'title': 'Vienna, Austria',
        'country': 'Austria',
        'city': 'Vienna',
        'price': 330,
        'duration_days': 5,
        'description': 'Imperial architecture, galleries, coffee culture and a calm European city route.',
        'image': 'destination-11.jpg',
        'departure_city': 'Lviv',
        'departure_date': '2026-08-01',
        'transport': 'Bus',
        'seats_total': 28,
    },
    {
        'route_code': 'NL-AMS-12',
        'title': 'Amsterdam, Netherlands',
        'country': 'Netherlands',
        'city': 'Amsterdam',
        'price': 610,
        'duration_days': 7,
        'description': 'Canals, museums, nearby towns and a comfortable cultural program.',
        'image': 'destination-12.jpg',
        'departure_city': 'Warsaw',
        'departure_date': '2026-08-18',
        'transport': 'Flight',
        'seats_total': 16,
    },
    {
        'route_code': 'GE-TBL-13',
        'title': 'Tbilisi, Georgia',
        'country': 'Georgia',
        'city': 'Tbilisi',
        'price': 340,
        'duration_days': 6,
        'description': 'Mountain views, old city walks, local cuisine and day trips outside Tbilisi.',
        'image': 'place-1.jpg',
        'departure_city': 'Kyiv',
        'departure_date': '2026-09-12',
        'transport': 'Flight',
        'seats_total': 20,
    },
    {
        'route_code': 'ME-BUD-14',
        'title': 'Budva, Montenegro',
        'country': 'Montenegro',
        'city': 'Budva',
        'price': 420,
        'duration_days': 8,
        'description': 'Adriatic beaches, old towns and scenic coastal excursions.',
        'image': 'place-2.jpg',
        'departure_city': 'Vinnytsia',
        'departure_date': '2026-07-30',
        'transport': 'Bus',
        'seats_total': 30,
    },
    {
        'route_code': 'NO-OSL-15',
        'title': 'Oslo, Norway',
        'country': 'Norway',
        'city': 'Oslo',
        'price': 690,
        'duration_days': 7,
        'description': 'Fjords, modern museums, Nordic architecture and nature-focused excursions.',
        'image': 'place-3.jpg',
        'departure_city': 'Warsaw',
        'departure_date': '2026-09-24',
        'transport': 'Flight',
        'seats_total': 14,
    },
    {
        'route_code': 'PT-LIS-16',
        'title': 'Lisbon, Portugal',
        'country': 'Portugal',
        'city': 'Lisbon',
        'price': 560,
        'duration_days': 7,
        'description': 'Ocean viewpoints, historic quarters, tram routes and a day by the Atlantic.',
        'image': 'place-4.jpg',
        'departure_city': 'Kyiv',
        'departure_date': '2026-10-07',
        'transport': 'Flight',
        'seats_total': 18,
    },
]


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


def make_booking_reference() -> str:
    return f"BK-{secrets.token_hex(4).upper()}"


def make_passenger_token() -> str:
    return secrets.token_urlsafe(32)


def passenger_link(token: str) -> str:
    return f"{request.host_url.rstrip('/')}/passenger.html?token={token}"


def normalize_value(value: Any) -> Any:
    if isinstance(value, dict):
        return {key: normalize_value(item) for key, item in value.items()}
    if isinstance(value, list):
        return [normalize_value(item) for item in value]
    if isinstance(value, tuple):
        return [normalize_value(item) for item in value]
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, decimal.Decimal):
        return float(value)
    return value


def json_response(payload: dict[str, Any], status: int = 200):
    return jsonify(normalize_value(payload)), status


def request_arg(name: str, default: str = '') -> str:
    return request.args.get(name, default, type=str).strip()


def request_arg_int(name: str) -> int | None:
    raw = request.args.get(name, '', type=str).strip()
    if not raw:
        return None
    try:
        return int(raw)
    except ValueError:
        return None


def parse_csv_values(value: Any, uppercase: bool = False) -> list[str]:
    items = [item.strip() for item in str(value or '').split(',') if item.strip()]
    if uppercase:
        return [item.upper() for item in items]
    return items


def can_manage_booking_date(value: Any) -> bool:
    if isinstance(value, datetime):
        target_date = value.date()
    elif isinstance(value, date):
        target_date = value
    else:
        try:
            target_date = datetime.fromisoformat(str(value)).date()
        except ValueError:
            return False
    return (target_date - date.today()).days >= 7


def apply_schema(cur: psycopg.Cursor[Any]) -> None:
    schema_sql = SCHEMA_PATH.read_text(encoding='utf-8').lstrip('\ufeff')
    statements = [statement.strip() for statement in schema_sql.split(';') if statement.strip()]
    table_statements = [statement for statement in statements if not statement.upper().startswith('CREATE INDEX')]
    index_statements = [statement for statement in statements if statement.upper().startswith('CREATE INDEX')]

    for statement in table_statements:
        cur.execute(statement)

    ensure_schema(cur)

    for statement in index_statements:
        cur.execute(statement)



def seed_admin_user(cur: psycopg.Cursor[Any]) -> None:
    if not ADMIN_EMAIL:
        return

    from werkzeug.security import generate_password_hash

    cur.execute('SELECT id FROM users WHERE LOWER(email) = %s LIMIT 1', (ADMIN_EMAIL,))
    existing = cur.fetchone()
    password_hash = generate_password_hash(ADMIN_PASSWORD)

    if existing:
        cur.execute(
            '''
            UPDATE users
            SET name = %s,
                password_hash = %s,
                provider = 'local',
                is_admin = TRUE
            WHERE id = %s
            ''',
            (ADMIN_NAME, password_hash, existing['id']),
        )
        return

    cur.execute(
        '''
        INSERT INTO users (name, phone, email, password_hash, provider, is_admin, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ''',
        (ADMIN_NAME, '', ADMIN_EMAIL, password_hash, 'local', True, utc_now()),
    )
def initialize_database() -> None:
    with db_connection() as conn:
        with conn.cursor() as cur:
            apply_schema(cur)
            seed_tours(cur)
            seed_admin_user(cur)
        conn.commit()


def ensure_schema(cur: psycopg.Cursor[Any]) -> None:
    cur.execute("ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS phone VARCHAR(50) DEFAULT ''")
    cur.execute("ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS password_hash TEXT DEFAULT NULL")
    cur.execute("ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS provider VARCHAR(50) NOT NULL DEFAULT 'local'")
    cur.execute("ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE")
    cur.execute("ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP")

    cur.execute("ALTER TABLE IF EXISTS tours ADD COLUMN IF NOT EXISTS route_code VARCHAR(40)")
    cur.execute("ALTER TABLE IF EXISTS tours ADD COLUMN IF NOT EXISTS departure_city VARCHAR(255) NOT NULL DEFAULT 'Vinnytsia'")
    cur.execute("ALTER TABLE IF EXISTS tours ADD COLUMN IF NOT EXISTS departure_date DATE")
    cur.execute("ALTER TABLE IF EXISTS tours ADD COLUMN IF NOT EXISTS transport VARCHAR(120) NOT NULL DEFAULT 'Flight'")
    cur.execute("ALTER TABLE IF EXISTS tours ADD COLUMN IF NOT EXISTS seats_total INTEGER NOT NULL DEFAULT 20")
    cur.execute("ALTER TABLE IF EXISTS tours ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP")

    cur.execute("ALTER TABLE IF EXISTS bookings ADD COLUMN IF NOT EXISTS booking_reference VARCHAR(40)")
    cur.execute("ALTER TABLE IF EXISTS bookings ADD COLUMN IF NOT EXISTS traveler_name VARCHAR(255)")
    cur.execute("ALTER TABLE IF EXISTS bookings ADD COLUMN IF NOT EXISTS traveler_phone VARCHAR(50)")
    cur.execute("ALTER TABLE IF EXISTS bookings ADD COLUMN IF NOT EXISTS traveler_email VARCHAR(255)")
    cur.execute("ALTER TABLE IF EXISTS bookings ADD COLUMN IF NOT EXISTS seats_reserved INTEGER NOT NULL DEFAULT 1")
    cur.execute("ALTER TABLE IF EXISTS bookings ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT ''")
    cur.execute("ALTER TABLE IF EXISTS bookings ADD COLUMN IF NOT EXISTS status VARCHAR(100) NOT NULL DEFAULT 'Pending confirmation'")
    cur.execute("ALTER TABLE IF EXISTS bookings ADD COLUMN IF NOT EXISTS is_split_booking BOOLEAN NOT NULL DEFAULT FALSE")
    cur.execute("ALTER TABLE IF EXISTS bookings ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP")

    cur.execute(
        '''
        CREATE TABLE IF NOT EXISTS booking_passengers (
            id BIGSERIAL PRIMARY KEY,
            booking_id BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
            full_name VARCHAR(255) NOT NULL DEFAULT '',
            seat_code VARCHAR(20) DEFAULT '',
            verification_token VARCHAR(120) UNIQUE,
            is_primary BOOLEAN NOT NULL DEFAULT FALSE,
            completed_at TIMESTAMPTZ DEFAULT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        '''
    )
    cur.execute("ALTER TABLE IF EXISTS booking_passengers ALTER COLUMN full_name SET DEFAULT ''")
    cur.execute("ALTER TABLE IF EXISTS booking_passengers ADD COLUMN IF NOT EXISTS seat_code VARCHAR(20) DEFAULT ''")
    cur.execute("ALTER TABLE IF EXISTS booking_passengers ADD COLUMN IF NOT EXISTS verification_token VARCHAR(120) UNIQUE")
    cur.execute("ALTER TABLE IF EXISTS booking_passengers ADD COLUMN IF NOT EXISTS is_primary BOOLEAN NOT NULL DEFAULT FALSE")
    cur.execute("ALTER TABLE IF EXISTS booking_passengers ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ DEFAULT NULL")
    cur.execute(
        '''
        CREATE TABLE IF NOT EXISTS booking_seats (
            id BIGSERIAL PRIMARY KEY,
            booking_id BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
            seat_code VARCHAR(20) NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (booking_id, seat_code)
        )
        '''
    )

    cur.execute("ALTER TABLE IF EXISTS messages ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES users(id) ON DELETE SET NULL")
    cur.execute("ALTER TABLE IF EXISTS messages ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP")

    cur.execute("UPDATE tours SET route_code = CONCAT('ROUTE-', id) WHERE route_code IS NULL")
    cur.execute("UPDATE tours SET departure_date = CURRENT_DATE + INTERVAL '14 days' WHERE departure_date IS NULL")
    cur.execute("UPDATE bookings SET booking_reference = CONCAT('BK-', id) WHERE booking_reference IS NULL")
    cur.execute("UPDATE bookings SET traveler_name = '' WHERE traveler_name IS NULL")
    cur.execute("UPDATE bookings SET traveler_phone = '' WHERE traveler_phone IS NULL")
    cur.execute("UPDATE bookings SET traveler_email = '' WHERE traveler_email IS NULL")
    if ADMIN_EMAIL:
        cur.execute("UPDATE users SET is_admin = TRUE WHERE LOWER(email) = %s", (ADMIN_EMAIL,))

    migrate_legacy_booking_details(cur)


def column_exists(cur: psycopg.Cursor[Any], table_name: str, column_name: str) -> bool:
    cur.execute(
        '''
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = %s AND column_name = %s
        LIMIT 1
        ''',
        (table_name, column_name),
    )
    return cur.fetchone() is not None


def migrate_legacy_booking_details(cur: psycopg.Cursor[Any]) -> None:
    has_selected_seats = column_exists(cur, 'bookings', 'selected_seats')
    has_passenger_manifest = column_exists(cur, 'bookings', 'passenger_manifest')
    if not has_selected_seats and not has_passenger_manifest:
        return

    select_seats_expr = "COALESCE(b.selected_seats, '') AS selected_seats" if has_selected_seats else "'' AS selected_seats"
    select_passengers_expr = "COALESCE(b.passenger_manifest, '') AS passenger_manifest" if has_passenger_manifest else "'' AS passenger_manifest"

    cur.execute(
        f'''
        SELECT b.id,
               {select_seats_expr},
               {select_passengers_expr},
               (SELECT COUNT(*) FROM booking_seats bs WHERE bs.booking_id = b.id) AS seat_rows,
               (SELECT COUNT(*) FROM booking_passengers bp WHERE bp.booking_id = b.id) AS passenger_rows
        FROM bookings b
        '''
    )

    for row in cur.fetchall():
        booking_id = int(row['id'])
        if int(row['seat_rows'] or 0) == 0:
            seats = [seat.strip().upper() for seat in str(row['selected_seats'] or '').split(',') if seat.strip()]
            for seat in seats:
                cur.execute(
                    '''
                    INSERT INTO booking_seats (booking_id, seat_code, created_at)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (booking_id, seat_code) DO NOTHING
                    ''',
                    (booking_id, seat, utc_now()),
                )

        if int(row['passenger_rows'] or 0) == 0:
            passengers = [name.strip() for name in str(row['passenger_manifest'] or '').split(',') if name.strip()]
            for passenger in passengers:
                cur.execute(
                    'INSERT INTO booking_passengers (booking_id, full_name, completed_at, created_at) VALUES (%s, %s, %s, %s)',
                    (booking_id, passenger, utc_now(), utc_now()),
                )


def refresh_split_booking_status(cur: psycopg.Cursor[Any], booking_id: int) -> str:
    cur.execute(
        '''
        SELECT b.is_split_booking,
               COUNT(bp.id) AS total_passengers,
               COUNT(bp.id) FILTER (WHERE COALESCE(NULLIF(TRIM(bp.full_name), ''), '') <> '') AS filled_passengers
        FROM bookings b
        LEFT JOIN booking_passengers bp ON bp.booking_id = b.id
        WHERE b.id = %s
        GROUP BY b.id
        ''',
        (booking_id,),
    )
    row = cur.fetchone()
    if not row:
        return ''
    if not bool(row['is_split_booking']):
        return ''
    total = int(row['total_passengers'] or 0)
    filled = int(row['filled_passengers'] or 0)
    status = 'Ready for processing' if total > 0 and filled >= total else 'Partially filled'
    cur.execute('UPDATE bookings SET status = %s WHERE id = %s', (status, booking_id))
    return status


def split_share_links(cur: psycopg.Cursor[Any], booking_id: int) -> list[dict[str, Any]]:
    cur.execute(
        '''
        SELECT id, seat_code, full_name, verification_token, is_primary, completed_at
        FROM booking_passengers
        WHERE booking_id = %s AND verification_token IS NOT NULL
        ORDER BY id
        ''',
        (booking_id,),
    )
    links = []
    for passenger in cur.fetchall():
        token = passenger.get('verification_token') or ''
        links.append({
            'passenger_id': passenger['id'],
            'seat_code': passenger.get('seat_code') or '',
            'full_name': passenger.get('full_name') or '',
            'is_primary': passenger.get('is_primary'),
            'completed_at': passenger.get('completed_at'),
            'url': passenger_link(token),
        })
    return links


def seed_tours(cur: psycopg.Cursor[Any]) -> None:
    for tour in SEED_TOURS:
        cur.execute('SELECT id FROM tours WHERE route_code = %s LIMIT 1', (tour['route_code'],))
        if cur.fetchone():
            continue
        cur.execute(
            '''
            INSERT INTO tours (
                route_code, title, country, city, price, duration_days, description, image,
                departure_city, departure_date, transport, seats_total, created_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ''',
            (
                tour['route_code'], tour['title'], tour['country'], tour['city'], tour['price'],
                tour['duration_days'], tour['description'], tour['image'], tour['departure_city'],
                tour['departure_date'], tour['transport'], tour['seats_total'], utc_now(),
            ),
        )


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
                'SELECT id, name, phone, email, provider, is_admin, created_at FROM users WHERE id = %s LIMIT 1',
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



def require_admin() -> dict[str, Any]:
    user = require_auth()
    if not bool(user.get('is_admin')):
        raise PermissionError('Доступ дозволено лише менеджеру.')
    return user
def sign_in(user: dict[str, Any]) -> None:
    session['user_id'] = int(user['id'])


def fetch_tour_with_availability(cur: psycopg.Cursor[Any], tour_id: int) -> dict[str, Any] | None:
    cur.execute(
        '''
        SELECT t.id, t.route_code, t.title, t.country, t.city, t.price, t.duration_days, t.description,
               t.image, t.departure_city, t.departure_date, t.transport, t.seats_total,
               COALESCE(SUM(b.seats_reserved), 0) AS seats_booked,
               GREATEST(t.seats_total - COALESCE(SUM(b.seats_reserved), 0), 0) AS seats_available
        FROM tours t
        LEFT JOIN bookings b ON b.tour_id = t.id AND b.status <> 'Cancelled'
        WHERE t.id = %s
        GROUP BY t.id
        LIMIT 1
        ''',
        (tour_id,),
    )
    tour = cur.fetchone()
    if not tour:
        return None

    occupied = occupied_seats(cur, tour_id)
    layout = transport_seat_layout(str(tour['transport']))
    tour['seat_map'] = {
        'layout': layout[: int(tour['seats_total'])],
        'occupied': sorted(list(occupied)),
    }
    return tour


def transport_seat_layout(transport: str) -> list[str]:
    normalized = (transport or '').lower()
    if 'train' in normalized:
        coaches = ['A', 'B', 'C', 'D']
        rows = range(1, 9)
        return [f'{coach}{row}' for row in rows for coach in coaches]
    if 'bus' in normalized:
        columns = ['A', 'B', 'C', 'D']
        rows = range(1, 7)
        return [f'{row}{column}' for row in rows for column in columns]
    columns = ['A', 'B', 'C', 'D', 'E', 'F']
    rows = range(1, 6)
    return [f'{row}{column}' for row in rows for column in columns]


def occupied_seats(cur: psycopg.Cursor[Any], tour_id: int, exclude_booking_id: int | None = None) -> set[str]:
    params: list[Any] = [tour_id]
    exclude_sql = ''
    if exclude_booking_id is not None:
        exclude_sql = 'AND b.id <> %s'
        params.append(exclude_booking_id)
    cur.execute(
        f'''
        SELECT bs.seat_code
        FROM booking_seats bs
        JOIN bookings b ON b.id = bs.booking_id
        WHERE b.tour_id = %s AND b.status <> 'Cancelled' {exclude_sql}
        ''',
        params,
    )
    occupied: set[str] = set()
    for row in cur.fetchall():
        value = (row.get('seat_code') or '').strip().upper()
        if value:
            occupied.add(value)
    return occupied


@app.errorhandler(PermissionError)
def handle_permission_error(error: PermissionError):
    return json_response({'ok': False, 'message': str(error)}, 401)


@app.errorhandler(Exception)
def handle_unexpected_error(error: Exception):
    if request.path.startswith('/api/'):
        app.logger.exception('API error on %s', request.path)
        return json_response({'ok': False, 'message': 'На сервері сталася помилка. Спробуйте ще раз.'}, 500)
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
                    INSERT INTO users (name, phone, email, password_hash, provider, is_admin, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    RETURNING id, name, phone, email, provider, is_admin, created_at
                    ''',
                    (name, phone, email, generate_password_hash(password), 'local', email == ADMIN_EMAIL, utc_now()),
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
                        INSERT INTO users (name, phone, email, password_hash, provider, is_admin, created_at)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                        RETURNING id, name, phone, email, provider, is_admin, created_at
                        ''',
                        (display_name, '', email, None, 'google', email == ADMIN_EMAIL, utc_now()),
                    )
                    user = cur.fetchone()
                conn.commit()

        sign_in(user)
        return json_response({'ok': True, 'message': 'Вхід через Google виконано успішно.', 'user': current_user()})

    return json_response({'ok': False, 'message': 'Невідома дія авторизації.'}, 400)


@app.get('/api/tours')
def tours_api():
    filters: list[str] = []
    params: list[Any] = []
    query = request_arg('query')
    country = request_arg('country')
    city = request_arg('city')
    date_from = request_arg('date_from')
    transport = request_arg('transport')
    sort = request_arg('sort') or 'date_asc'
    price_min = request_arg_int('price_min')
    price_max = request_arg_int('price_max')
    duration_days = request_arg_int('duration_days')
    available_seats = request_arg_int('available_seats')

    if query:
        filters.append("(t.title ILIKE %s OR t.country ILIKE %s OR t.city ILIKE %s)")
        wildcard = f'%{query}%'
        params.extend([wildcard, wildcard, wildcard])
    if country:
        filters.append('t.country ILIKE %s')
        params.append(f'%{country}%')
    if city:
        filters.append('t.city ILIKE %s')
        params.append(f'%{city}%')
    if date_from:
        filters.append('t.departure_date >= %s')
        params.append(date_from)
    if transport:
        filters.append('t.transport ILIKE %s')
        params.append(f'%{transport}%')
    if price_min is not None:
        filters.append('t.price >= %s')
        params.append(price_min)
    if price_max is not None:
        filters.append('t.price <= %s')
        params.append(price_max)
    if duration_days is not None:
        filters.append('t.duration_days <= %s')
        params.append(duration_days)

    where_sql = f"WHERE {' AND '.join(filters)}" if filters else ''
    having_sql = ''
    if available_seats is not None:
        having_sql = "HAVING GREATEST(t.seats_total - COALESCE(SUM(b.seats_reserved), 0), 0) >= %s"
        params.append(available_seats)

    order_map = {
        'price_asc': 't.price ASC, t.departure_date ASC',
        'price_desc': 't.price DESC, t.departure_date ASC',
        'duration_asc': 't.duration_days ASC, t.departure_date ASC',
        'duration_desc': 't.duration_days DESC, t.departure_date ASC',
        'seats_desc': 'seats_available DESC, t.departure_date ASC',
        'date_desc': 't.departure_date DESC, t.id ASC',
        'date_asc': 't.departure_date ASC, t.id ASC',
    }
    order_sql = order_map.get(sort, order_map['date_asc'])

    with db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                f'''
                SELECT t.id, t.route_code, t.title, t.country, t.city, t.price, t.duration_days, t.description,
                       t.image, t.departure_city, t.departure_date, t.transport, t.seats_total,
                       COALESCE(SUM(b.seats_reserved), 0) AS seats_booked,
                       GREATEST(t.seats_total - COALESCE(SUM(b.seats_reserved), 0), 0) AS seats_available
                FROM tours t
                LEFT JOIN bookings b ON b.tour_id = t.id AND b.status <> 'Cancelled'
                {where_sql}
                GROUP BY t.id
                {having_sql}
                ORDER BY {order_sql}
                ''',
                params,
            )
            tours = cur.fetchall()
            for tour in tours:
                occupied = occupied_seats(cur, int(tour['id']))
                layout = transport_seat_layout(str(tour['transport']))
                tour['seat_map'] = {
                    'layout': layout[: int(tour['seats_total'])],
                    'occupied': sorted(list(occupied)),
                }
    return json_response({'ok': True, 'tours': tours})


@app.get('/api/tours/<int:tour_id>')
def tour_detail_api(tour_id: int):
    with db_connection() as conn:
        with conn.cursor() as cur:
            tour = fetch_tour_with_availability(cur, tour_id)
            if not tour:
                return json_response({'ok': False, 'message': 'Тур не знайдено.'}, 404)
    return json_response({'ok': True, 'tour': tour})


@app.route('/api/bookings', methods=['GET', 'POST'])
def bookings_api():
    user = require_auth()

    if request.method == 'GET':
        with db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    '''
                    SELECT b.id, b.booking_reference, b.date_from, b.seats_reserved, b.notes, b.status, b.created_at,
                           b.traveler_name, b.traveler_phone, b.traveler_email,
                           COALESCE((
                               SELECT string_agg(bs.seat_code, ', ' ORDER BY bs.seat_code)
                               FROM booking_seats bs
                               WHERE bs.booking_id = b.id
                           ), '') AS selected_seats,
                           b.is_split_booking,
                           COALESCE((
                               SELECT string_agg(NULLIF(bp.full_name, ''), ', ' ORDER BY bp.id)
                               FROM booking_passengers bp
                               WHERE bp.booking_id = b.id
                           ), '') AS passenger_manifest,
                           COALESCE((
                               SELECT json_agg(json_build_object(
                                   'seat_code', bp.seat_code,
                                   'full_name', bp.full_name,
                                   'is_primary', bp.is_primary,
                                   'completed_at', bp.completed_at,
                                   'url', CASE WHEN bp.verification_token IS NOT NULL THEN CONCAT(%s::text, bp.verification_token) ELSE '' END
                               ) ORDER BY bp.id)
                               FROM booking_passengers bp
                               WHERE bp.booking_id = b.id
                           ), '[]'::json) AS passenger_links,
                           (b.date_from - CURRENT_DATE) AS days_until_trip,
                           (b.date_from >= CURRENT_DATE + INTERVAL '7 days') AS can_manage,
                           t.route_code, t.title, t.country, t.city, t.price, t.duration_days, t.image,
                           t.departure_city, t.departure_date, t.transport
                    FROM bookings b
                    JOIN tours t ON t.id = b.tour_id
                    WHERE b.user_id = %s
                    ORDER BY b.created_at DESC
                    ''',
                    (f"{request.host_url.rstrip('/')}/passenger.html?token=", user['id']),
                )
                bookings = cur.fetchall()
        return json_response({'ok': True, 'bookings': bookings})

    data = request_data()
    tour_id = int(data.get('tour_id', 0) or 0)
    seats_reserved = max(1, int(data.get('seats_reserved', data.get('people_count', 1)) or 1))
    notes = data.get('notes', '').strip()
    selected_seats = parse_csv_values(data.get('selected_seats', ''), uppercase=True)
    passenger_names = parse_csv_values(data.get('passenger_manifest', ''))
    is_split_booking = str(data.get('split_booking', 'false')).lower() == 'true'

    with db_connection() as conn:
        with conn.cursor() as cur:
            tour = fetch_tour_with_availability(cur, tour_id)
            if not tour:
                return json_response({'ok': False, 'message': 'Обраний тур не знайдено.'}, 404)
            if seats_reserved > int(tour['seats_available']):
                return json_response({'ok': False, 'message': 'Недостатньо вільних місць для цього маршруту.'}, 409)

            seat_map = tour.get('seat_map') or {}
            available_layout = set(seat_map.get('layout') or [])
            occupied = set(seat_map.get('occupied') or [])
            if len(selected_seats) != seats_reserved:
                return json_response({'ok': False, 'message': 'Оберіть точну кількість місць для всіх пасажирів.'}, 422)
            if is_split_booking:
                passenger_names = passenger_names[:1] or [str(user['name']).strip()]
            if not is_split_booking and len(passenger_names) != seats_reserved:
                return json_response({'ok': False, 'message': 'Вкажіть дані для кожного пасажира.'}, 422)
            if any(seat not in available_layout for seat in selected_seats):
                return json_response({'ok': False, 'message': 'Одне або кілька обраних місць недоступні для цього транспорту.'}, 422)
            if len(set(selected_seats)) != len(selected_seats):
                return json_response({'ok': False, 'message': 'Не можна вибрати одне й те саме місце двічі.'}, 422)
            if any(seat in occupied for seat in selected_seats):
                return json_response({'ok': False, 'message': 'Частина обраних місць уже зайнята. Оновіть вибір.'}, 409)

            booking_date = data.get('date_from', '').strip() or str(tour['departure_date'])
            reference = make_booking_reference()
            cur.execute(
                '''
                INSERT INTO bookings (
                    user_id, tour_id, booking_reference, traveler_name, traveler_phone, traveler_email,
                    date_from, seats_reserved, notes, status, is_split_booking, created_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
                ''',
                (
                    user['id'], tour_id, reference, user['name'], user.get('phone') or '', user['email'],
                    booking_date, seats_reserved, notes,
                    'Partially filled' if is_split_booking and seats_reserved > 1 else 'Pending confirmation',
                    is_split_booking, utc_now(),
                ),
            )
            booking = cur.fetchone()
            booking_id = int(booking['id'])

            for seat in selected_seats:
                cur.execute(
                    'INSERT INTO booking_seats (booking_id, seat_code, created_at) VALUES (%s, %s, %s)',
                    (booking_id, seat, utc_now()),
                )

            for index, seat in enumerate(selected_seats):
                if is_split_booking:
                    passenger_name = passenger_names[0] if index == 0 else ''
                    token = make_passenger_token()
                    cur.execute(
                        '''
                        INSERT INTO booking_passengers (
                            booking_id, full_name, seat_code, verification_token, is_primary, completed_at, created_at
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                        ''',
                        (
                            booking_id, passenger_name, seat, token, index == 0,
                            utc_now() if passenger_name else None, utc_now(),
                        ),
                    )
                    continue

                passenger_name = passenger_names[index]
                cur.execute(
                    '''
                    INSERT INTO booking_passengers (booking_id, full_name, seat_code, completed_at, created_at)
                    VALUES (%s, %s, %s, %s, %s)
                    ''',
                    (booking_id, passenger_name, seat, utc_now(), utc_now()),
                )

            if is_split_booking:
                refresh_split_booking_status(cur, booking_id)
                links = split_share_links(cur, booking_id)
            else:
                links = []
        conn.commit()

    return json_response({
        'ok': True,
        'message': 'Бронювання створено. Місця зарезервовано у вашому кабінеті.',
        'split_links': links,
    })


@app.route('/api/bookings/<int:booking_id>', methods=['GET', 'PATCH', 'DELETE'])
def booking_detail_api(booking_id: int):
    user = require_auth()

    with db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                '''
                SELECT b.id, b.user_id, b.tour_id, b.booking_reference, b.date_from, b.seats_reserved,
                       b.notes, b.status, b.is_split_booking,
                       t.title, t.route_code, t.transport, t.seats_total, t.departure_date
                FROM bookings b
                JOIN tours t ON t.id = b.tour_id
                WHERE b.id = %s AND b.user_id = %s
                LIMIT 1
                ''',
                (booking_id, user['id']),
            )
            booking = cur.fetchone()
            if not booking:
                return json_response({'ok': False, 'message': 'Бронювання не знайдено.'}, 404)

            if request.method == 'GET':
                cur.execute(
                    '''
                    SELECT seat_code
                    FROM booking_seats
                    WHERE booking_id = %s
                    ORDER BY seat_code
                    ''',
                    (booking_id,),
                )
                seats = [row['seat_code'] for row in cur.fetchall()]
                cur.execute(
                    '''
                    SELECT id, full_name, seat_code, is_primary, completed_at
                    FROM booking_passengers
                    WHERE booking_id = %s
                    ORDER BY id
                    ''',
                    (booking_id,),
                )
                passengers = cur.fetchall()
                layout = transport_seat_layout(str(booking['transport']))[: int(booking['seats_total'])]
                occupied = occupied_seats(cur, int(booking['tour_id']), exclude_booking_id=booking_id)
                booking['selected_seats'] = seats
                booking['passengers'] = passengers
                booking['seat_map'] = {'layout': layout, 'occupied': sorted(list(occupied))}
                booking['can_manage'] = can_manage_booking_date(booking['date_from'])
                return json_response({'ok': True, 'booking': booking})

            if not can_manage_booking_date(booking['date_from']):
                return json_response({
                    'ok': False,
                    'message': 'Редагування або видалення доступне лише не пізніше ніж за 7 днів до поїздки.',
                }, 403)

            if request.method == 'DELETE':
                cur.execute('DELETE FROM bookings WHERE id = %s AND user_id = %s', (booking_id, user['id']))
                conn.commit()
                return json_response({'ok': True, 'message': 'Бронювання видалено.'})

            data = request_data()
            selected_seats = parse_csv_values(data.get('selected_seats', ''), uppercase=True)
            passenger_names = parse_csv_values(data.get('passenger_manifest', ''))
            notes = data.get('notes', '').strip()
            seats_reserved = int(booking['seats_reserved'])

            if len(selected_seats) != seats_reserved:
                return json_response({'ok': False, 'message': 'Кількість місць має відповідати кількості пасажирів.'}, 422)
            if len(set(selected_seats)) != len(selected_seats):
                return json_response({'ok': False, 'message': 'Не можна вибрати одне й те саме місце двічі.'}, 422)
            if len(passenger_names) != seats_reserved:
                return json_response({'ok': False, 'message': 'Вкажіть ПІБ для кожного пасажира.'}, 422)

            layout = set(transport_seat_layout(str(booking['transport']))[: int(booking['seats_total'])])
            occupied = occupied_seats(cur, int(booking['tour_id']), exclude_booking_id=booking_id)
            if any(seat not in layout for seat in selected_seats):
                return json_response({'ok': False, 'message': 'Одне або кілька місць недоступні для цього транспорту.'}, 422)
            if any(seat in occupied for seat in selected_seats):
                return json_response({'ok': False, 'message': 'Частина місць уже зайнята іншим бронюванням.'}, 409)

            cur.execute('UPDATE bookings SET notes = %s WHERE id = %s', (notes, booking_id))
            cur.execute('DELETE FROM booking_seats WHERE booking_id = %s', (booking_id,))
            for seat in selected_seats:
                cur.execute(
                    'INSERT INTO booking_seats (booking_id, seat_code, created_at) VALUES (%s, %s, %s)',
                    (booking_id, seat, utc_now()),
                )

            cur.execute(
                '''
                SELECT id
                FROM booking_passengers
                WHERE booking_id = %s
                ORDER BY id
                ''',
                (booking_id,),
            )
            passenger_rows = cur.fetchall()
            for index, passenger_name in enumerate(passenger_names):
                seat = selected_seats[index]
                completed_at = utc_now() if passenger_name else None
                if index < len(passenger_rows):
                    cur.execute(
                        '''
                        UPDATE booking_passengers
                        SET full_name = %s, seat_code = %s, completed_at = %s
                        WHERE id = %s
                        ''',
                        (passenger_name, seat, completed_at, passenger_rows[index]['id']),
                    )
                else:
                    cur.execute(
                        '''
                        INSERT INTO booking_passengers (booking_id, full_name, seat_code, completed_at, created_at)
                        VALUES (%s, %s, %s, %s, %s)
                        ''',
                        (booking_id, passenger_name, seat, completed_at, utc_now()),
                    )
            if bool(booking['is_split_booking']):
                refresh_split_booking_status(cur, booking_id)
        conn.commit()

    return json_response({'ok': True, 'message': 'Бронювання оновлено.'})


@app.get('/api/admin/bookings')
def admin_bookings_api():
    require_admin()
    query = request_arg('query')
    status_filter = request_arg('status')
    filters: list[str] = []
    params: list[Any] = []

    if query:
        filters.append('(b.booking_reference ILIKE %s OR b.traveler_name ILIKE %s OR b.traveler_email ILIKE %s OR t.title ILIKE %s)')
        wildcard = f'%{query}%'
        params.extend([wildcard, wildcard, wildcard, wildcard])
    if status_filter:
        filters.append('b.status = %s')
        params.append(status_filter)

    where_sql = f"WHERE {' AND '.join(filters)}" if filters else ''

    with db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                f'''
                SELECT b.id, b.booking_reference, b.date_from, b.seats_reserved, b.notes, b.status, b.created_at,
                       b.traveler_name, b.traveler_phone, b.traveler_email,
                       u.name AS user_name, u.email AS user_email,
                       COALESCE((
                           SELECT string_agg(bs.seat_code, ', ' ORDER BY bs.seat_code)
                           FROM booking_seats bs
                           WHERE bs.booking_id = b.id
                       ), '') AS selected_seats,
                       b.is_split_booking,
                       COALESCE((
                           SELECT string_agg(NULLIF(bp.full_name, ''), ', ' ORDER BY bp.id)
                           FROM booking_passengers bp
                           WHERE bp.booking_id = b.id
                       ), '') AS passenger_manifest,
                       COALESCE((
                           SELECT COUNT(*)
                           FROM booking_passengers bp
                           WHERE bp.booking_id = b.id AND COALESCE(NULLIF(TRIM(bp.full_name), ''), '') <> ''
                       ), 0) AS passengers_completed,
                       COALESCE((
                           SELECT json_agg(json_build_object(
                               'seat_code', bp.seat_code,
                               'full_name', bp.full_name,
                               'is_primary', bp.is_primary,
                               'completed_at', bp.completed_at,
                               'url', CASE WHEN bp.verification_token IS NOT NULL THEN CONCAT(%s::text, bp.verification_token) ELSE '' END
                           ) ORDER BY bp.id)
                           FROM booking_passengers bp
                           WHERE bp.booking_id = b.id
                       ), '[]'::json) AS passenger_links,
                       t.route_code, t.title, t.country, t.city, t.price, t.duration_days, t.image,
                       t.departure_city, t.departure_date, t.transport
                FROM bookings b
                JOIN users u ON u.id = b.user_id
                JOIN tours t ON t.id = b.tour_id
                {where_sql}
                ORDER BY b.created_at DESC
                ''',
                [f"{request.host_url.rstrip('/')}/passenger.html?token=", *params],
            )
            bookings = cur.fetchall()
    return json_response({'ok': True, 'bookings': bookings})


@app.post('/api/admin/bookings/<int:booking_id>/status')
def admin_booking_status_api(booking_id: int):
    require_admin()
    data = request_data()
    status = data.get('status', '').strip()
    allowed_statuses = {
        'Pending confirmation', 'Partially filled', 'Ready for processing',
        'Confirmed', 'Awaiting payment', 'Cancelled', 'Completed'
    }
    if status not in allowed_statuses:
        return json_response({'ok': False, 'message': 'Недопустимий статус бронювання.'}, 422)

    with db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute('UPDATE bookings SET status = %s WHERE id = %s RETURNING id', (status, booking_id))
            booking = cur.fetchone()
            if not booking:
                return json_response({'ok': False, 'message': 'Бронювання не знайдено.'}, 404)
        conn.commit()

    return json_response({'ok': True, 'message': 'Статус бронювання оновлено.'})


@app.route('/api/passenger-verification/<token>', methods=['GET', 'POST'])
def passenger_verification_api(token: str):
    normalized_token = token.strip()
    if len(normalized_token) < 24:
        return json_response({'ok': False, 'message': 'Посилання для пасажира некоректне.'}, 404)

    with db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                '''
                SELECT bp.id AS passenger_id, bp.booking_id, bp.full_name, bp.seat_code, bp.is_primary, bp.completed_at,
                       b.booking_reference, b.date_from, b.status, b.seats_reserved,
                       t.route_code, t.title, t.country, t.city, t.departure_city, t.departure_date, t.transport
                FROM booking_passengers bp
                JOIN bookings b ON b.id = bp.booking_id
                JOIN tours t ON t.id = b.tour_id
                WHERE bp.verification_token = %s
                LIMIT 1
                ''',
                (normalized_token,),
            )
            passenger = cur.fetchone()
            if not passenger:
                return json_response({'ok': False, 'message': 'Посилання не знайдено або воно вже недоступне.'}, 404)

            if request.method == 'GET':
                return json_response({'ok': True, 'passenger': passenger})

            data = request_data()
            full_name = data.get('full_name', '').strip()
            if len(full_name) < 3:
                return json_response({'ok': False, 'message': 'Вкажіть повне імʼя пасажира.'}, 422)

            cur.execute(
                '''
                UPDATE booking_passengers
                SET full_name = %s, completed_at = %s
                WHERE id = %s
                ''',
                (full_name, utc_now(), passenger['passenger_id']),
            )
            status = refresh_split_booking_status(cur, int(passenger['booking_id']))
        conn.commit()

    return json_response({
        'ok': True,
        'message': 'Дані пасажира збережено. Дякуємо!',
        'status': status,
    })


@app.get('/api/admin/analytics')
def admin_analytics_api():
    require_admin()
    with db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                '''
                WITH booking_velocity AS (
                    SELECT
                        t.id,
                        t.route_code,
                        t.title,
                        t.country,
                        t.city,
                        t.departure_date,
                        t.transport,
                        t.seats_total,
                        COALESCE(SUM(b.seats_reserved) FILTER (WHERE b.status <> 'Cancelled'), 0) AS seats_booked,
                        COALESCE(SUM(b.seats_reserved) FILTER (
                            WHERE b.status <> 'Cancelled' AND b.created_at >= CURRENT_DATE - INTERVAL '30 days'
                        ), 0) AS seats_last_30_days,
                        COALESCE(SUM(b.seats_reserved) FILTER (
                            WHERE b.status <> 'Cancelled' AND b.created_at >= CURRENT_DATE - INTERVAL '7 days'
                        ), 0) AS seats_last_7_days,
                        COUNT(b.id) FILTER (WHERE b.status = 'Partially filled') AS partial_bookings
                    FROM tours t
                    LEFT JOIN bookings b ON b.tour_id = t.id
                    WHERE t.departure_date >= CURRENT_DATE
                    GROUP BY t.id
                )
                SELECT *,
                       GREATEST(seats_total - seats_booked, 0) AS seats_available,
                       ROUND((seats_booked::numeric / NULLIF(seats_total, 0)) * 100, 1) AS load_percent,
                       ROUND((seats_last_30_days::numeric / 30) * GREATEST(departure_date - CURRENT_DATE, 0), 1) AS projected_extra_seats
                FROM booking_velocity
                ORDER BY departure_date ASC, title ASC
                '''
            )
            rows = cur.fetchall()
            cur.execute(
                '''
                SELECT
                    COUNT(b.id) AS total_bookings,
                    COUNT(b.id) FILTER (WHERE b.status <> 'Cancelled') AS active_bookings,
                    COUNT(b.id) FILTER (WHERE b.status = 'Cancelled') AS cancelled_bookings,
                    COUNT(b.id) FILTER (WHERE b.status = 'Partially filled') AS partial_bookings,
                    COUNT(b.id) FILTER (WHERE b.status = 'Ready for processing') AS ready_bookings,
                    COALESCE(SUM(b.seats_reserved) FILTER (WHERE b.status <> 'Cancelled'), 0) AS active_seats,
                    COALESCE(SUM(b.seats_reserved * t.price) FILTER (WHERE b.status <> 'Cancelled'), 0) AS booked_value,
                    COUNT(b.id) FILTER (WHERE b.created_at >= CURRENT_DATE - INTERVAL '7 days') AS bookings_last_7_days,
                    COUNT(b.id) FILTER (WHERE b.created_at >= CURRENT_DATE - INTERVAL '30 days') AS bookings_last_30_days
                FROM bookings b
                JOIN tours t ON t.id = b.tour_id
                '''
            )
            overview = cur.fetchone() or {}

            cur.execute(
                '''
                SELECT COUNT(*) AS upcoming_routes,
                       COALESCE(SUM(seats_total), 0) AS upcoming_capacity
                FROM tours
                WHERE departure_date >= CURRENT_DATE
                '''
            )
            capacity = cur.fetchone() or {}

            cur.execute(
                '''
                SELECT b.status,
                       COUNT(*) AS bookings_count,
                       COALESCE(SUM(b.seats_reserved), 0) AS seats_count
                FROM bookings b
                GROUP BY b.status
                ORDER BY bookings_count DESC, b.status ASC
                '''
            )
            status_counts = cur.fetchall()

            cur.execute(
                '''
                SELECT to_char(date_trunc('month', b.created_at), 'YYYY-MM') AS period,
                       COUNT(*) AS bookings_count,
                       COALESCE(SUM(b.seats_reserved), 0) AS seats_count
                FROM bookings b
                WHERE b.created_at >= date_trunc('month', CURRENT_DATE) - INTERVAL '5 months'
                GROUP BY date_trunc('month', b.created_at)
                ORDER BY date_trunc('month', b.created_at)
                '''
            )
            monthly_trend = cur.fetchall()

    routes = []
    hot_count = 0
    weak_count = 0
    total_booked = 0
    total_capacity = 0
    for row in rows:
        seats_total = int(row['seats_total'] or 0)
        seats_booked = int(row['seats_booked'] or 0)
        load_percent = float(row['load_percent'] or 0)
        days_left = 0
        departure_date = row.get('departure_date')
        if isinstance(departure_date, date):
            days_left = max((departure_date - date.today()).days, 0)
        projected_total = min(
            seats_total,
            seats_booked + max(float(row.get('projected_extra_seats') or 0), float(row.get('seats_last_7_days') or 0)),
        )
        projected_load_percent = round((projected_total / seats_total) * 100, 1) if seats_total else 0
        if load_percent >= 80 or projected_load_percent >= 90:
            signal = 'deficit'
            recommendation = 'Високий попит: підготуйте додатковий автобус або лист очікування.'
            hot_count += 1
        elif days_left <= 30 and load_percent < 35:
            signal = 'discount'
            recommendation = 'Низький попит: варто запустити знижку або переглянути дату виїзду.'
            weak_count += 1
        else:
            signal = 'stable'
            recommendation = 'Попит у межах норми, достатньо стандартного моніторингу.'

        total_booked += seats_booked
        total_capacity += seats_total
        routes.append({
            **row,
            'days_left': days_left,
            'projected_load_percent': projected_load_percent,
            'signal': signal,
            'recommendation': recommendation,
        })

    summary = {
        'routes_total': len(routes),
        'deficit_routes': hot_count,
        'discount_routes': weak_count,
        'average_load_percent': round((total_booked / total_capacity) * 100, 1) if total_capacity else 0,
    }
    overview_payload = {
        **overview,
        **capacity,
        'forecasted_revenue': overview.get('booked_value', 0),
        'active_capacity_load_percent': round((total_booked / total_capacity) * 100, 1) if total_capacity else 0,
    }
    manager_actions = []
    if hot_count:
        manager_actions.append({
            'type': 'deficit',
            'title': 'Є дефіцитні напрямки',
            'text': 'Попит іде швидше за план. Перевірте можливість підняття ціни або додаткового транспорту.',
        })
    if weak_count:
        manager_actions.append({
            'type': 'discount',
            'title': 'Є рейси з низьким попитом',
            'text': 'Запустіть акцію, персональну розсилку або перегляньте доцільність виїзду.',
        })
    if not manager_actions:
        manager_actions.append({
            'type': 'stable',
            'title': 'Ситуація стабільна',
            'text': 'Критичних відхилень немає. Достатньо стандартного моніторингу заявок.',
        })

    return json_response({
        'ok': True,
        'summary': summary,
        'overview': overview_payload,
        'status_counts': status_counts,
        'monthly_trend': monthly_trend,
        'manager_actions': manager_actions,
        'routes': routes,
    })

@app.get('/api/profile')
def profile_api():
    user = require_auth()
    with db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                '''
                SELECT COUNT(*) AS total_bookings,
                       COALESCE(SUM(seats_reserved), 0) AS total_seats,
                       MIN(date_from) FILTER (WHERE date_from >= CURRENT_DATE) AS next_trip_date
                FROM bookings
                WHERE user_id = %s
                ''',
                (user['id'],),
            )
            stats = cur.fetchone()

    return json_response({'ok': True, 'user': user, 'stats': stats})


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

    user = current_user()

    with db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                'INSERT INTO messages (user_id, name, email, subject, message, created_at) VALUES (%s, %s, %s, %s, %s, %s)',
                (user['id'] if user else None, name, email, subject, message, utc_now()),
            )
        conn.commit()

    return json_response({'ok': True, 'message': 'Повідомлення збережено успішно.'})


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




















