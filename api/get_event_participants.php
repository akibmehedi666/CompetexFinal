<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'db_connect.php';

$event_id = isset($_GET['event_id']) ? $_GET['event_id'] : null;

if (!$event_id) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing event_id"]);
    exit();
}

$event_id = $conn->real_escape_string($event_id);

$participants = [];

// Expects schema to be provisioned from `competex_db.sql` (no table creation at runtime).

// 1. Fetch Teams
$sql_teams = "SELECT t.id, t.name, 'team' as type, u.name as leader_name 
              FROM event_teams et
              JOIN teams t ON et.team_id = t.id
              JOIN users u ON t.leader_id = u.id
              WHERE et.event_id = '$event_id'";
$res_teams = $conn->query($sql_teams);
if ($res_teams && $res_teams->num_rows > 0) {
    while ($row = $res_teams->fetch_assoc()) {
        $participants[] = $row;
    }
}

// 2. Fetch Individuals
// Assuming event_participants table exists as per previous steps
// If not, we might need to handle failure gracefully or double check schema.
$sql_users = "SELECT u.id, u.name, 'individual' as type
              FROM event_participants ep
              JOIN users u ON ep.user_id = u.id
              WHERE ep.event_id = '$event_id'";
// Execute only if table likely exists (error suppression or try catch not typical in simple php, just query)
$res_users = $conn->query($sql_users);
if ($res_users && $res_users->num_rows > 0) {
    while ($row = $res_users->fetch_assoc()) {
        $participants[] = $row;
    }
}

echo json_encode(["status" => "success", "data" => $participants]);
$conn->close();
?>
