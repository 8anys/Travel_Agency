<?php
declare(strict_types=1);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

const APP_ROOT = __DIR__ . '/..';
const SCHEMA_PATH = APP_ROOT . '/database/schema.sql';

function db(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $host = getenv('PGHOST') ?: '127.0.0.1';
    $port = getenv('PGPORT') ?: '5432';
    $database = getenv('PGDATABASE') ?: 'travel_agency';
    $username = getenv('PGUSER') ?: 'postgres';
    $password = getenv('PGPASSWORD') ?: 'postgres';

    $dsn = sprintf('pgsql:host=%s;port=%s;dbname=%s', $host, $port, $database);

    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    initialize_database($pdo);

    return $pdo;
}

function initialize_database(PDO $pdo): void
{
    $exists = (bool) $pdo->query("SELECT to_regclass('public.users') IS NOT NULL")->fetchColumn();
    if ($exists) {
        return;
    }

    $schema = file_get_contents(SCHEMA_PATH);
    if ($schema === false) {
        throw new RuntimeException('Не вдалося прочитати schema.sql');
    }

    $pdo->exec($schema);
    seed_tours($pdo);
}

function seed_tours(PDO $pdo): void
{
    $count = (int) $pdo->query('SELECT COUNT(*) FROM tours')->fetchColumn();
    if ($count > 0) {
        return;
    }

    $tours = [
        ['Ретимнон, Греція', 'Греція', 'Ретимнон', 300, 8, 'Подорож до сонячного узбережжя Криту з прогулянками старим містом та відпочинком біля моря.', 'destination-1.jpg'],
        ['Балі, Індонезія', 'Індонезія', 'Балі', 300, 10, 'Екзотичний тур з океаном, храмами та релаксом на острові Балі.', 'destination-2.jpg'],
        ['Оттава, Канада', 'Канада', 'Оттава', 300, 7, 'Міська подорож до столиці Канади з культурною програмою та екскурсіями.', 'destination-3.jpg'],
        ['Сінгапур', 'Сінгапур', 'Сінгапур', 450, 6, 'Сучасний мегаполіс, футуристичні сади та гастрономічні враження.', 'place-1.jpg'],
        ['Канада Nature', 'Канада', 'Ванкувер', 520, 9, 'Поєднання міських локацій і природних парків Канади.', 'place-2.jpg'],
        ['Таїланд Escape', 'Таїланд', 'Пхукет', 390, 8, 'Тропічний відпочинок біля моря з острівними турами.', 'place-3.jpg']
    ];

    $stmt = $pdo->prepare('INSERT INTO tours (title, country, city, price, duration_days, description, image, created_at) VALUES (:title, :country, :city, :price, :duration_days, :description, :image, :created_at)');
    foreach ($tours as $tour) {
        $stmt->execute([
            ':title' => $tour[0],
            ':country' => $tour[1],
            ':city' => $tour[2],
            ':price' => $tour[3],
            ':duration_days' => $tour[4],
            ':description' => $tour[5],
            ':image' => $tour[6],
            ':created_at' => date('c'),
        ]);
    }
}

function request_data(): array
{
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if (stripos($contentType, 'application/json') !== false) {
        $raw = file_get_contents('php://input');
        $decoded = json_decode($raw ?: '[]', true);
        return is_array($decoded) ? $decoded : [];
    }

    return $_POST;
}

function json_response(array $payload, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function current_user(): ?array
{
    $userId = $_SESSION['user_id'] ?? null;
    if (!$userId) {
        return null;
    }

    $stmt = db()->prepare('SELECT id, name, phone, email, provider, created_at FROM users WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $userId]);
    $user = $stmt->fetch();

    if (!$user) {
        unset($_SESSION['user_id']);
        return null;
    }

    return $user;
}

function require_auth(): array
{
    $user = current_user();
    if (!$user) {
        json_response([
            'ok' => false,
            'message' => 'Щоб продовжити, увійдіть у свій акаунт.'
        ], 401);
    }

    return $user;
}

function find_user_by_email(string $email): ?array
{
    $stmt = db()->prepare('SELECT * FROM users WHERE email = :email LIMIT 1');
    $stmt->execute([':email' => mb_strtolower(trim($email))]);
    $user = $stmt->fetch();

    return $user ?: null;
}

function sign_in(array $user): void
{
    $_SESSION['user_id'] = (int) $user['id'];
}