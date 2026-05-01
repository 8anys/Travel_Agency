<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

$stmt = db()->query('SELECT id, title, country, city, price, duration_days, description, image FROM tours ORDER BY id ASC');
json_response(['ok' => true, 'tours' => $stmt->fetchAll()]);