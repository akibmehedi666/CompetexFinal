<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'db_connect.php';

$sql = "SELECT t.*, 
        tm.user_id, tm.joined_at,
        u.name as user_name, u.avatar as user_avatar, u.skills as user_skills,
        (CASE WHEN t.leader_id = u.id THEN 'leader' ELSE 'member' END) as member_role
        FROM teams t
        LEFT JOIN team_members tm ON t.id = tm.team_id
        LEFT JOIN users u ON tm.user_id = u.id
        ORDER BY t.created_at DESC";

$result = $conn->query($sql);

if ($result) {
    $teams = [];
    while ($row = $result->fetch_assoc()) {
        $team_id = $row['id'];

        if (!isset($teams[$team_id])) {
            $teams[$team_id] = [
                'id' => $row['id'],
                'name' => $row['name'],
                'description' => $row['description'],
                'project' => $row['project_idea'], // Mapping project_idea to project
                'categories' => [], // TODO: Add categories to DB or derive
                'requiredSkills' => json_decode($row['required_skills']) ?: [],
                'maxMembers' => intval($row['max_members']),
                'leaderId' => $row['leader_id'],
                'status' => $row['status'],
                'competition' => $row['competition_id'], // Or map to name
                'members' => []
            ];
        }

        if ($row['user_id']) {
            $teams[$team_id]['members'][] = [
                'id' => $row['user_id'],
                'name' => $row['user_name'],
                'avatar' => $row['user_avatar'],
                'role' => $row['member_role'] ?? ($row['user_id'] === $row['leader_id'] ? 'leader' : 'member'),
                'skills' => json_decode($row['user_skills']) ?: []
            ];
        }
    }

    echo json_encode(array_values($teams));
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $conn->error]);
}

$conn->close();
?>