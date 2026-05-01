<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

$user = require_auth();

$countStmt = db()->prepare('SELECT COUNT(*) FROM bookings WHERE user_id = :user_id');
$countStmt->execute([':user_id' => $user['id']]);
$totalBookings = (int) $countStmt->fetchColumn();

$lastStmt = db()->prepare('SELECT MAX(created_at) FROM bookings WHERE user_id = :user_id');
$lastStmt->execute([':user_id' => $user['id']]);
$lastBookingAt = $lastStmt->fetchColumn() ?: null;

json_response([
    'ok' => true,
    'user' => $user,
    'stats' => [
        'total_bookings' => $totalBookings,
        'last_booking_at' => $lastBookingAt,
    ],
]);