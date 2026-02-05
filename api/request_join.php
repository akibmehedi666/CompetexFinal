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

if (!isset($data->team_id) || !isset($data->user_id)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing team_id or user_id"]);
    exit();
}

$team_id = $conn->real_escape_string($data->team_id);
$user_id = $conn->real_escape_string($data->user_id);
$request_id = uniqid();

// 1. Check if already a member
$check_member = $conn->query("SELECT * FROM team_members WHERE team_id='$team_id' AND user_id='$user_id'");
if ($check_member->num_rows > 0) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Already a member"]);
    exit();
}

// 2. Check if request already pending
$check_request = $conn->query("SELECT * FROM team_requests WHERE team_id='$team_id' AND user_id='$user_id' AND status='pending'");
if ($check_request->num_rows > 0) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Request already pending"]);
    exit();
}

// 3. Insert Request
$sql = "INSERT INTO team_requests (id, team_id, user_id, status) VALUES ('$request_id', '$team_id', '$user_id', 'pending')";

if ($conn->query($sql)) {
    // Notify team leader (best-effort)
    $metaSql = "
        SELECT
            t.leader_id,
            t.name AS team_name,
            u.name AS requester_name
        FROM teams t
        JOIN users u ON u.id = ?
        WHERE t.id = ?
        LIMIT 1
    ";
    $stmt = $conn->prepare($metaSql);
    if ($stmt) {
        $stmt->bind_param("ss", $user_id, $team_id);
        $stmt->execute();
        $res = $stmt->get_result();
        if ($res && $res->num_rows > 0) {
            $row = $res->fetch_assoc();
            $leaderId = (string)($row["leader_id"] ?? "");
            if ($leaderId !== "") {
                $teamName = (string)($row["team_name"] ?? "your team");
                $requesterName = (string)($row["requester_name"] ?? "A participant");
                $msg = "{$requesterName} requested to join \"{$teamName}\".";
                competex_notify_user($conn, $leaderId, "team_join_request", $msg, (string)$request_id);
            }
        }
        $stmt->close();
    }

    http_response_code(201);
    echo json_encode(["status" => "success", "message" => "Request sent successfully"]);
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $conn->error]);
}

$conn->close();
?>
