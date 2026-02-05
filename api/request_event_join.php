<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'db_connect.php';
require_once __DIR__ . '/lib/notifications.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->event_id) || !isset($data->user_id)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing event_id or user_id"]);
    exit();
}

$event_id = $conn->real_escape_string($data->event_id);
$user_id = $conn->real_escape_string($data->user_id);
// team_id is optional for individual join
$team_id = isset($data->team_id) ? $conn->real_escape_string($data->team_id) : "NULL";

// Check if request already exists
$check_sql = "SELECT id FROM event_requests WHERE event_id='$event_id' AND (user_id='$user_id' OR (team_id IS NOT NULL AND team_id='$team_id'))";
if ($team_id === "NULL") {
    $check_sql = "SELECT id FROM event_requests WHERE event_id='$event_id' AND user_id='$user_id'";
}

$check = $conn->query($check_sql);
if ($check->num_rows > 0) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Request already pending or approved"]);
    exit();
}

$request_id = uniqid('req_');
$created_at = date("Y-m-d H:i:s");

$sql = "INSERT INTO event_requests (id, event_id, team_id, user_id, status, created_at) VALUES ('$request_id', '$event_id', " . ($team_id === "NULL" ? "NULL" : "'$team_id'") . ", '$user_id', 'pending', '$created_at')";

if ($conn->query($sql)) {
    // Notify organizer (best-effort)
    $metaStmt = $conn->prepare("SELECT organizer_id, title FROM events WHERE id = ? LIMIT 1");
    if ($metaStmt) {
        $metaStmt->bind_param("s", $event_id);
        $metaStmt->execute();
        $metaRes = $metaStmt->get_result();
        if ($metaRes && $metaRes->num_rows > 0) {
            $row = $metaRes->fetch_assoc();
            $organizerId = (string)($row["organizer_id"] ?? "");
            if ($organizerId !== "") {
                $eventTitle = (string)($row["title"] ?? "an event");
                $msg = "New join request pending for \"{$eventTitle}\".";
                competex_notify_user($conn, $organizerId, "event_join_request", $msg, (string)$request_id);
            }
        }
        $metaStmt->close();
    }

    echo json_encode(["status" => "success", "message" => "Request submitted successfully"]);
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $conn->error]);
}

$conn->close();
?>
