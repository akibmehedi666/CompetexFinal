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

if (!isset($data->team_id) || !isset($data->user_id) || !isset($data->leader_id)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing team_id, user_id, or leader_id"]);
    exit();
}

$team_id = $conn->real_escape_string($data->team_id);
$user_id = $conn->real_escape_string($data->user_id);
$leader_id = $conn->real_escape_string($data->leader_id);

// 1. Verify Team Ownership
$sql = "SELECT leader_id FROM teams WHERE id = '$team_id'";
$result = $conn->query($sql);

if ($result->num_rows === 0) {
    http_response_code(404);
    echo json_encode(["status" => "error", "message" => "Team not found"]);
    exit();
}

$team = $result->fetch_assoc();

if ($team['leader_id'] !== $leader_id) {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Unauthorized: Only the team leader can remove members"]);
    exit();
}

// 2. Prevent Leader form removing themselves (optional safety check, though UI shouldn't allow it)
if ($user_id === $leader_id) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Team leader cannot be removed"]);
    exit();
}

// 3. Remove Member
$delete_sql = "DELETE FROM team_members WHERE team_id = '$team_id' AND user_id = '$user_id'";

if ($conn->query($delete_sql)) {
    if ($conn->affected_rows > 0) {
        // Notify removed member (best-effort)
        $metaStmt = $conn->prepare("
            SELECT t.name AS team_name, u.name AS leader_name
            FROM teams t
            JOIN users u ON u.id = t.leader_id
            WHERE t.id = ?
            LIMIT 1
        ");
        if ($metaStmt) {
            $metaStmt->bind_param("s", $team_id);
            $metaStmt->execute();
            $metaRes = $metaStmt->get_result();
            if ($metaRes && $metaRes->num_rows > 0) {
                $row = $metaRes->fetch_assoc();
                $teamName = (string)($row["team_name"] ?? "the team");
                $leaderName = (string)($row["leader_name"] ?? "The team leader");
                $msg = "You were removed from \"{$teamName}\" by {$leaderName}.";
                competex_notify_user($conn, $user_id, "team_member_removed", $msg, $team_id);
            }
            $metaStmt->close();
        }

        echo json_encode(["status" => "success", "message" => "Member removed successfully"]);
    } else {
        // Could happen if user wasn't in the team to begin with
        echo json_encode(["status" => "success", "message" => "Member was not in the team"]);
    }
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to remove member: " . $conn->error]);
}

$conn->close();
?>
