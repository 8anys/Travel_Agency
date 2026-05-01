<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

$data = request_data();
$name = trim((string) ($data['name'] ?? ''));
$email = mb_strtolower(trim((string) ($data['email'] ?? '')));
$subject = trim((string) ($data['subject'] ?? ''));
$message = trim((string) ($data['message'] ?? ''));

if ($name === '' || $email === '' || $subject === '' || $message === '') {
    json_response(['ok' => false, 'message' => 'Будь ласка, заповніть усі поля форми зворотного зв’язку.'], 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_response(['ok' => false, 'message' => 'Введіть коректний email.'], 422);
}

$stmt = db()->prepare('INSERT INTO messages (name, email, subject, message, created_at) VALUES (:name, :email, :subject, :message, :created_at)');
$stmt->execute([
    ':name' => $name,
    ':email' => $email,
    ':subject' => $subject,
    ':message' => $message,
    ':created_at' => date('c'),
]);

json_response(['ok' => true, 'message' => 'Повідомлення збережено успішно.']);