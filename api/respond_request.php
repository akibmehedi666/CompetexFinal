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

if (!isset($data->request_id) || !isset($data->action) || !isset($data->leader_id)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing request_id, action, or leader_id"]);
    exit();
}

$request_id = $conn->real_escape_string($data->request_id);
$action = $data->action; // 'accept' or 'reject'
$leader_id = $conn->real_escape_string($data->leader_id);

// 1. Verify Request & Team Ownership
$sql = "SELECT tr.*, t.leader_id as team_leader_id 
        FROM team_requests tr 
        JOIN teams t ON tr.team_id = t.id 
        WHERE tr.id = '$request_id'";

$result = $conn->query($sql);

if ($result->num_rows === 0) {
    http_response_code(404);
    echo json_encode(["status" => "error", "message" => "Request not found"]);
    exit();
}

$request = $result->fetch_assoc();

if ($request['team_leader_id'] !== $leader_id) {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit();
}

if ($request['status'] !== 'pending') {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Request already handled"]);
    exit();
}

$conn->begin_transaction();

try {
    // 2. Update Request Status
    $new_status = ($action === 'accept') ? 'accepted' : 'rejected';
    $update_sql = "UPDATE team_requests SET status='$new_status' WHERE id='$request_id'";

    if (!$conn->query($update_sql)) {
        throw new Exception("Failed to update status");
    }

    // 3. If Accepted, Add to Team Members
    if ($action === 'accept') {
        $team_id = $request['team_id'];
        $user_id = $request['user_id'];

        $insert_member = "INSERT INTO team_members (team_id, user_id) VALUES ('$team_id', '$user_id')";
        if (!$conn->query($insert_member)) {
            throw new Exception("Failed to add member");
        }
    }

    // Notify requester (best-effort)
    $team_id = (string)$request['team_id'];
    $user_id = (string)$request['user_id'];
    $teamName = "the team";
    $teamRes = $conn->query("SELECT name FROM teams WHERE id = '$team_id' LIMIT 1");
    if ($teamRes && $teamRes->num_rows > 0) {
        $t = $teamRes->fetch_assoc();
        if (!empty($t['name'])) $teamName = (string)$t['name'];
    }
    $note = $new_status === 'accepted'
        ? "Your request to join \"{$teamName}\" was accepted."
        : "Your request to join \"{$teamName}\" was rejected.";
    competex_notify_user($conn, $user_id, "team_join_request_result", $note, (string)$request_id);

    // Mark leader's join-request notification as read (best-effort)
    competex_mark_notification_read($conn, (string)$leader_id, "team_join_request", (string)$request_id);

    $conn->commit();
    echo json_encode(["status" => "success", "message" => "Request " . $new_status]);

} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}

$conn->close();
?>
