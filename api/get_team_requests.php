<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

include_once 'db_connect.php';

if (!isset($_GET['team_id'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing team_id"]);
    exit();
}

$team_id = $conn->real_escape_string($_GET['team_id']);

$sql = "SELECT tr.id as request_id, tr.status, tr.created_at,
        u.id as user_id, u.name as user_name, u.avatar as user_avatar, u.skills as user_skills
        FROM team_requests tr
        JOIN users u ON tr.user_id = u.id
        WHERE tr.team_id = '$team_id' AND tr.status = 'pending'
        ORDER BY tr.created_at DESC";

$result = $conn->query($sql);

$requests = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $row['user_skills'] = json_decode($row['user_skills']) ?: [];
        $requests[] = $row;
    }
}

echo json_encode($requests);
$conn->close();
?>