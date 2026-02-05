<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db_connect.php';

$event_id = isset($_GET['event_id']) ? trim((string)$_GET['event_id']) : '';
$organizer_id = isset($_GET['organizer_id']) ? trim((string)$_GET['organizer_id']) : '';

if ($event_id === '' || $organizer_id === '') {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing event_id or organizer_id"]);
    $conn->close();
    exit();
}

// SQL-level ownership check (and ensure organizer role)
$stmt = $conn->prepare("
    SELECT 1
    FROM events e
    JOIN users u ON e.organizer_id = u.id
    WHERE e.id = ?
      AND e.organizer_id = ?
      AND u.role IN ('Organizer', 'organizer')
    LIMIT 1
");
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $conn->error]);
    $conn->close();
    exit();
}

$stmt->bind_param("ss", $event_id, $organizer_id);
$stmt->execute();
$res = $stmt->get_result();
$isOwner = $res && $res->num_rows > 0;

echo json_encode(["status" => "success", "is_owner" => $isOwner]);

$stmt->close();
$conn->close();
?>
