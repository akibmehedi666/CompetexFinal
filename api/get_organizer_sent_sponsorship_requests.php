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

$organizer_id = isset($_GET['organizer_id']) ? trim((string)$_GET['organizer_id']) : '';

if ($organizer_id === '') {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing organizer_id"]);
    exit();
}

// Expects schema to be provisioned from competex_db.sql (no table creation at runtime).

$sql = "
    SELECT
        sr.id,
        sr.event_id,
        e.title AS event_title,
        sr.sponsor_id,
        COALESCE(sp.company_name, u.name) AS sponsor_name,
        sr.requested_amount,
        sr.message,
        sr.status,
        sr.created_at
    FROM sponsorship_requests sr
    JOIN events e ON sr.event_id = e.id
    LEFT JOIN sponsor_profiles sp ON sr.sponsor_id = sp.id
    LEFT JOIN users u ON sp.user_id = u.id
    WHERE sr.organizer_id = ?
    ORDER BY sr.created_at DESC
";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $conn->error]);
    exit();
}

$stmt->bind_param("s", $organizer_id);
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
