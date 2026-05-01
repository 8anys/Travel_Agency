<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

$user = require_auth();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $stmt = db()->prepare('SELECT b.id, b.date_from, b.people_count, b.notes, b.status, b.created_at, t.title, t.country, t.city, t.price, t.duration_days, t.image FROM bookings b JOIN tours t ON t.id = b.tour_id WHERE b.user_id = :user_id ORDER BY b.created_at DESC');
    $stmt->execute([':user_id' => $user['id']]);
    $bookings = $stmt->fetchAll();

    json_response(['ok' => true, 'bookings' => $bookings]);
}

$data = request_data();
$tourId = (int) ($data['tour_id'] ?? 0);
$dateFrom = trim((string) ($data['date_from'] ?? ''));
$peopleCount = max(1, (int) ($data['people_count'] ?? 1));
$notes = trim((string) ($data['notes'] ?? ''));

if ($tourId <= 0 || $dateFrom === '') {
    json_response(['ok' => false, 'message' => 'Вкажіть тур і дату поїздки.'], 422);
}

$tourStmt = db()->prepare('SELECT id, title FROM tours WHERE id = :id LIMIT 1');
$tourStmt->execute([':id' => $tourId]);
$tour = $tourStmt->fetch();
if (!$tour) {
    json_response(['ok' => false, 'message' => 'Обраний тур не знайдено.'], 404);
}

$stmt = db()->prepare('INSERT INTO bookings (user_id, tour_id, date_from, people_count, notes, status, created_at) VALUES (:user_id, :tour_id, :date_from, :people_count, :notes, :status, :created_at)');
$stmt->execute([
    ':user_id' => $user['id'],
    ':tour_id' => $tourId,
    ':date_from' => $dateFrom,
    ':people_count' => $peopleCount,
    ':notes' => $notes,
    ':status' => 'Нова заявка',
    ':created_at' => date('c'),
]);

json_response(['ok' => true, 'message' => 'Бронювання створено успішно. Воно вже доступне у вашому кабінеті.']);