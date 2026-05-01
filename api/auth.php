<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_GET['action'] ?? ($_POST['action'] ?? 'status');

if ($method === 'GET' && $action === 'status') {
    json_response([
        'ok' => true,
        'user' => current_user(),
    ]);
}

$data = request_data();
$action = $data['action'] ?? $action;

if ($action === 'logout') {
    unset($_SESSION['user_id']);
    json_response(['ok' => true, 'message' => 'Ви вийшли з акаунта.']);
}

if ($action === 'register') {
    $name = trim((string) ($data['name'] ?? ''));
    $phone = trim((string) ($data['phone'] ?? ''));
    $email = mb_strtolower(trim((string) ($data['email'] ?? '')));
    $password = (string) ($data['password'] ?? '');
    $passwordConfirm = (string) ($data['passwordConfirm'] ?? '');
    $policy = filter_var($data['policy'] ?? false, FILTER_VALIDATE_BOOLEAN);

    if ($name === '' || $phone === '' || $email === '' || $password === '' || $passwordConfirm === '') {
        json_response(['ok' => false, 'message' => 'Будь ласка, заповніть усі поля для реєстрації.'], 422);
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        json_response(['ok' => false, 'message' => 'Введіть коректний email.'], 422);
    }

    if (mb_strlen($password) < 6) {
        json_response(['ok' => false, 'message' => 'Пароль має містити щонайменше 6 символів.'], 422);
    }

    if ($password !== $passwordConfirm) {
        json_response(['ok' => false, 'message' => 'Паролі не співпадають.'], 422);
    }

    if (!$policy) {
        json_response(['ok' => false, 'message' => 'Потрібно погодитися на обробку персональних даних.'], 422);
    }

    if (find_user_by_email($email)) {
        json_response(['ok' => false, 'message' => 'Акаунт з таким email уже існує.'], 409);
    }

    $stmt = db()->prepare('INSERT INTO users (name, phone, email, password_hash, provider, created_at) VALUES (:name, :phone, :email, :password_hash, :provider, :created_at)');
    $stmt->execute([
        ':name' => $name,
        ':phone' => $phone,
        ':email' => $email,
        ':password_hash' => password_hash($password, PASSWORD_DEFAULT),
        ':provider' => 'local',
        ':created_at' => date('c'),
    ]);

    $user = find_user_by_email($email);
    sign_in($user);

    json_response(['ok' => true, 'message' => 'Акаунт створено успішно.', 'user' => current_user()]);
}

if ($action === 'login') {
    $email = mb_strtolower(trim((string) ($data['email'] ?? '')));
    $password = (string) ($data['password'] ?? '');

    if ($email === '' || $password === '') {
        json_response(['ok' => false, 'message' => 'Вкажіть email і пароль.'], 422);
    }

    $user = find_user_by_email($email);
    if (!$user) {
        json_response(['ok' => false, 'message' => 'Користувача з таким email не знайдено.'], 404);
    }

    if (($user['provider'] ?? 'local') === 'google') {
        json_response(['ok' => false, 'message' => 'Для цього акаунта використайте вхід через Google.'], 409);
    }

    if (!password_verify($password, (string) $user['password_hash'])) {
        json_response(['ok' => false, 'message' => 'Неправильний пароль.'], 401);
    }

    sign_in($user);
    json_response(['ok' => true, 'message' => 'Вхід виконано успішно.', 'user' => current_user()]);
}

if ($action === 'google') {
    $email = mb_strtolower(trim((string) ($data['email'] ?? '')));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        json_response(['ok' => false, 'message' => 'Вкажіть коректний Google email.'], 422);
    }

    $user = find_user_by_email($email);
    if (!$user) {
        $displayName = ucwords(str_replace(['.', '_', '-'], ' ', strstr($email, '@', true) ?: 'Google User'));
        $stmt = db()->prepare('INSERT INTO users (name, phone, email, password_hash, provider, created_at) VALUES (:name, :phone, :email, :password_hash, :provider, :created_at)');
        $stmt->execute([
            ':name' => $displayName,
            ':phone' => '',
            ':email' => $email,
            ':password_hash' => null,
            ':provider' => 'google',
            ':created_at' => date('c'),
        ]);
        $user = find_user_by_email($email);
    }

    sign_in($user);
    json_response(['ok' => true, 'message' => 'Вхід через Google виконано успішно.', 'user' => current_user()]);
}

json_response(['ok' => false, 'message' => 'Невідома дія авторизації.'], 400);