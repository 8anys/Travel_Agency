# Local Setup

## Manager Login
Default manager account for `admin.html`:

- Email: `manager@travelagency.local`
- Password: `Manager2026!`

You can change these values before startup with environment variables:

```powershell
$env:ADMIN_EMAIL='manager@travelagency.local'
$env:ADMIN_PASSWORD='Manager2026!'
$env:ADMIN_NAME='Менеджер системи'
```

After login, open:

`http://127.0.0.1:5000/admin.html`

## Що вже реалізовано
- Реєстрація та вхід через серверний `Python API`
- Збереження користувачів у базі даних `PostgreSQL`
- Створення бронювань для турів
- Особистий кабінет `cabinet.html`
- Збереження повідомлень із контактної форми

## Що потрібно для запуску
1. Встановити `Python 3.11+`.
2. Встановити `PostgreSQL`.
3. Створити базу даних `travel_agency`.
4. Відкрити термінал у папці проекту.

## Створення бази даних PostgreSQL
1. Відкрити `pgAdmin` або `psql`.
2. Створити базу даних:
   `CREATE DATABASE travel_agency;`
3. За потреби створити окремого користувача або використати `postgres`.
4. SQL зі схеми застосовується автоматично Python-сервером при першому запуску.

## Встановлення залежностей
1. Створити віртуальне середовище:
   `python -m venv .venv`
2. Активувати його:
   Windows PowerShell:
   `.\.venv\Scripts\Activate.ps1`
3. Встановити пакети:
   `pip install -r requirements.txt`

## Налаштування підключення до PostgreSQL
Python-сервер читає такі змінні середовища:
- `PGHOST` — за замовчуванням `127.0.0.1`
- `PGPORT` — за замовчуванням `5432`
- `PGDATABASE` — за замовчуванням `travel_agency`
- `PGUSER` — за замовчуванням `postgres`
- `PGPASSWORD` — за замовчуванням `postgres`
- `FLASK_SECRET_KEY` — секрет для сесій

Приклад для PowerShell:
`$env:PGHOST='127.0.0.1'`
`$env:PGPORT='5432'`
`$env:PGDATABASE='travel_agency'`
`$env:PGUSER='postgres'`
`$env:PGPASSWORD='postgres'`
`$env:FLASK_SECRET_KEY='travel-agency-secret'`

## Запуск сервера
У корені проекту виконай:
`python app.py`

Після запуску відкрий у браузері:
`http://127.0.0.1:5000/`

## Як працює база даних
- SQL-схема лежить тут:
  `database/schema.sql`
- Python-сервер перевіряє, чи існує таблиця `users`.
- Якщо таблиць ще немає, схема автоматично застосовується до `PostgreSQL`.
- Після цього в таблицю `tours` автоматично додаються стартові тури.

## Основні API
- `GET /api/auth/status`
- `POST /api/auth`
- `GET/POST /api/bookings`
- `GET /api/profile`
- `POST /api/contact`
- `GET /api/tours`

## Що перевірити після запуску
1. Натиснути `Забронювати зараз`.
2. Створити новий акаунт.
3. Відкрити `cabinet.html` і перевірити профіль.
4. Перейти на `destination.html` та натиснути `Забронювати тур`.
5. Перевірити, що бронювання з’явилося в кабінеті.

## Наступний етап
Після цього можна:
- зробити справжню Google OAuth авторизацію
- додати редагування профілю
- додати статуси бронювань для менеджера
- зробити окрему панель менеджера для перегляду всіх заявок
