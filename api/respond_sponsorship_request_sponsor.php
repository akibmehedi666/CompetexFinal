<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db_connect.php';
require_once __DIR__ . '/lib/notifications.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->request_id) || !isset($data->action) || !isset($data->sponsor_user_id)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing request_id, action, or sponsor_user_id"]);
    exit();
}

$request_id = trim((string)$data->request_id);
$action = trim((string)$data->action); // accepted | rejected
$sponsor_user_id = trim((string)$data->sponsor_user_id);

if (!in_array($action, ['accepted', 'rejected'], true)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid action"]);
    exit();
}

// Expects schema to be provisioned from `competex_db.sql` (no table creation at runtime).

// Atomic SQL-level enforcement (ownership + pending-only transition)
$sql = "
    UPDATE sponsorship_requests sr
    JOIN sponsor_profiles sp ON sr.sponsor_id = sp.id
    SET sr.status = ?
    WHERE sr.id = ?
      AND sp.user_id = ?
      AND sr.status = 'pending'
";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $conn->error]);
    exit();
}

$stmt->bind_param("sss", $action, $request_id, $sponsor_user_id);
$stmt->execute();
$affected = $stmt->affected_rows;
$stmt->close();

if ($affected === 0) {
    http_response_code(409);
    echo json_encode(["status" => "error", "message" => "Request not found, not pending, or not owned by this sponsor."]);
    $conn->close();
    exit();
}

// Notify organizer (best-effort)
$selectNotif = "
    SELECT
        sr.organizer_id AS user_id,
        sr.id AS reference_id,
        CASE
            WHEN sr.status = 'accepted' THEN CONCAT('Sponsor accepted your sponsorship request for \"', e.title, '\".')
            WHEN sr.status = 'rejected' THEN CONCAT('Sponsor rejected your sponsorship request for \"', e.title, '\".')
            ELSE CONCAT('Sponsorship request updated for \"', e.title, '\".')
        END AS message
    FROM sponsorship_requests sr
    JOIN events e ON e.id = sr.event_id
    WHERE sr.id = ?
    LIMIT 1
";
competex_notify_from_select_mysqli($conn, $selectNotif, "s", [$request_id], "sponsorship_request_result");

echo json_encode(["status" => "success", "message" => "Request {$action}"]);

$conn->close();
?>
