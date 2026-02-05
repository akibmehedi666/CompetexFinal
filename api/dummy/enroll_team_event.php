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

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->event_id) || !isset($data->team_id) || !isset($data->user_id)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing event_id, team_id, or user_id"]);
    exit();
}

$event_id = $conn->real_escape_string($data->event_id);
$team_id = $conn->real_escape_string($data->team_id);
$user_id = $conn->real_escape_string($data->user_id);
$enroll_id = uniqid('enr_');

// 0. Verify Leader
$check_leader = $conn->query("SELECT leader_id FROM teams WHERE id='$team_id'");
if ($check_leader->num_rows === 0) {
    http_response_code(404);
    echo json_encode(["status" => "error", "message" => "Team not found"]);
    exit();
}
$team_data = $check_leader->fetch_assoc();
if ($team_data['leader_id'] !== $user_id) {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Only team leader can enroll team"]);
    exit();
}

// 1. Verify Request is Approved (Security check)
// This ensures they didn't just bypass the UI
// Look for *any* approved request for this pair
$check_approval = $conn->query("SELECT * FROM event_requests WHERE event_id='$event_id' AND team_id='$team_id' AND status='approved'");
if ($check_approval->num_rows === 0) {
    // Optional: Allow direct enrollment if event is Open? 
    // For now, adhere to flow: Request -> Approve -> Enroll
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Team request has not been approved yet"]);
    exit();
}

// 2. Insert into event_teams
$sql = "INSERT INTO event_teams (id, event_id, team_id) VALUES ('$enroll_id', '$event_id', '$team_id')";

if ($conn->query($sql)) {
    echo json_encode(["status" => "success", "message" => "Team enrolled successfully", "enroll_id" => $enroll_id]);
} else {
    // Check for duplicate err
    if ($conn->errno == 1062) {
        echo json_encode(["status" => "success", "message" => "Team already enrolled"]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database error: " . $conn->error]);
    }
}

$conn->close();
?>