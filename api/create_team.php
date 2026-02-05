<?php
// Set headers immediately
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Handle Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Logging
function log_debug($message)
{
    file_put_contents("debug_log.txt", date('Y-m-d H:i:s') . " - " . print_r($message, true) . "\n", FILE_APPEND);
}

log_debug("--- New Request ---");

include_once 'db_connect.php';

// Get Input
$raw_input = file_get_contents("php://input");
log_debug("Raw Input: " . $raw_input);

$data = json_decode($raw_input);

if (
    !isset($data->name) ||
    !isset($data->leader_id) ||
    !isset($data->max_members) ||
    !isset($data->description)
) {
    log_debug("Error: Incomplete data");
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Incomplete data."]);
    exit();
}

$team_id = isset($data->id) ? $data->id : uniqid();
$name = $conn->real_escape_string($data->name);
$leader_id = $conn->real_escape_string($data->leader_id);

// Handle optional fields for SQL (Convert to 'NULL' string or escaped value)
$competition_id = (isset($data->competition_id) && $data->competition_id !== "") ? "'" . $conn->real_escape_string($data->competition_id) . "'" : "NULL";
$max_members = intval($data->max_members);
$description = $conn->real_escape_string($data->description);
$project_idea = isset($data->project_idea) ? "'" . $conn->real_escape_string($data->project_idea) . "'" : "NULL";
$status = isset($data->status) ? "'" . $conn->real_escape_string($data->status) . "'" : "'open'";
$required_skills = isset($data->required_skills) ? "'" . $conn->real_escape_string(json_encode($data->required_skills)) . "'" : "NULL";

log_debug("Preparing to insert Team: $team_id");

// Start transaction
$conn->begin_transaction();

try {
    // 1. Insert Team
    $sql_team = "INSERT INTO teams (id, name, leader_id, competition_id, max_members, description, project_idea, status, required_skills) 
                 VALUES ('$team_id', '$name', '$leader_id', $competition_id, $max_members, '$description', $project_idea, $status, $required_skills)";

    // log_debug("SQL: " . $sql_team); // Uncomment to debug SQL errors

    if (!$conn->query($sql_team)) {
        throw new Exception("Team creation failed: " . $conn->error);
    }

    // 2. Insert Leader as Member
    $sql_member = "INSERT INTO team_members (team_id, user_id) VALUES ('$team_id', '$leader_id')";

    if (!$conn->query($sql_member)) {
        throw new Exception("Adding leader failed: " . $conn->error);
    }

    $conn->commit();
    log_debug("Success");

    http_response_code(201);
    echo json_encode([
        "status" => "success",
        "message" => "Team created successfully.",
        "team" => [
            "id" => $team_id,
            "name" => $name,
            "leaderId" => $leader_id,
            "description" => $description,
            "status" => trim($status, "'")
        ]
    ]);

} catch (Exception $e) {
    $conn->rollback();
    log_debug("Exception: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}

$conn->close();
?>