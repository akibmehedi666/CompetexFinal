<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'db_connect.php';

$event_id = isset($_GET['event_id']) ? $_GET['event_id'] : null;
$team_id = isset($_GET['team_id']) ? $_GET['team_id'] : null;

if (!$event_id || !$team_id) {
    // Try Body
    $data = json_decode(file_get_contents("php://input"));
    $event_id = $event_id ?? ($data->event_id ?? null);
    $team_id = $team_id ?? ($data->team_id ?? null);
}

if (!$event_id || !$team_id) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing event_id or team_id"]);
    exit();
}

$event_id = $conn->real_escape_string($event_id);
$team_id = $conn->real_escape_string($team_id);

$response = [
    "status" => "success",
    "request_status" => null,
    "is_enrolled" => false
];

// Check Enrollment
$check_enroll = $conn->query("SELECT * FROM event_teams WHERE event_id='$event_id' AND team_id='$team_id'");
if ($check_enroll->num_rows > 0) {
    $response['is_enrolled'] = true;
}

// Check Request Status (Latest)
$check_request = $conn->query("SELECT status FROM event_requests WHERE event_id='$event_id' AND team_id='$team_id' ORDER BY created_at DESC LIMIT 1");
if ($check_request->num_rows > 0) {
    $row = $check_request->fetch_assoc();
    $response['request_status'] = $row['status'];
}

echo json_encode($response);
$conn->close();
?>