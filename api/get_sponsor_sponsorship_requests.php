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

$sponsor_user_id = isset($_GET['sponsor_user_id']) ? trim((string)$_GET['sponsor_user_id']) : '';
$status = isset($_GET['status']) ? trim((string)$_GET['status']) : '';

if ($sponsor_user_id === '') {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing sponsor_user_id"]);
    exit();
}

// Expects schema to be provisioned from competex_db.sql (no table creation at runtime).

$validStatuses = ['pending', 'accepted', 'rejected'];
$filterStatus = in_array($status, $validStatuses, true) ? $status : null;

$sql = "
    SELECT
        sr.id,
        sr.event_id,
        e.title AS event_title,
        e.description AS event_description,
        e.date_display,
        e.start_date,
        e.venue,
        e.mode,
        e.category,
        e.image,
        sr.organizer_id,
        u.name AS organizer_name,
        sr.requested_amount,
        sr.message,
        sr.status,
        sr.created_at
    FROM sponsorship_requests sr
    JOIN sponsor_profiles sp ON sr.sponsor_id = sp.id
    JOIN events e ON sr.event_id = e.id
    JOIN users u ON sr.organizer_id = u.id
    WHERE sp.user_id = ?
";

if ($filterStatus) {
    $sql .= " AND sr.status = ?";
}

$sql .= " ORDER BY sr.created_at DESC";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $conn->error]);
    exit();
}

if ($filterStatus) {
    $stmt->bind_param("ss", $sponsor_user_id, $filterStatus);
} else {
    $stmt->bind_param("s", $sponsor_user_id);
}

$stmt->execute();
$res = $stmt->get_result();
$rows = [];
while ($res && ($row = $res->fetch_assoc())) {
    $rows[] = $row;
}

echo json_encode(["status" => "success", "data" => $rows]);

$stmt->close();
$conn->close();
?>
