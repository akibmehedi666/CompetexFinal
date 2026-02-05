<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'db_connect.php';

if (!isset($_GET['user_id'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing user_id"]);
    exit();
}

$user_id = trim($_GET['user_id']);

// Fetch all teams the user has joined (across all events) with team size and role in a single SQL query.
$sql = "
    SELECT
        t.id AS team_id,
        t.name AS team_name,
        t.leader_id,
        t.competition_id AS event_id,
        e.title AS event_title,
        IF(t.leader_id = ?, 1, 0) AS is_leader,
        IF(t.leader_id = ?, 'Leader', 'Member') AS role,
        COUNT(tm2.user_id) AS member_count
    FROM team_members tm
    JOIN teams t ON tm.team_id = t.id
    LEFT JOIN events e ON t.competition_id = e.id
    LEFT JOIN team_members tm2 ON tm2.team_id = t.id
    WHERE tm.user_id = ?
    GROUP BY
        t.id,
        t.name,
        t.leader_id,
        t.competition_id,
        e.title
    ORDER BY
        (e.title IS NULL) ASC,
        e.title ASC,
        t.name ASC
";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $conn->error]);
    $conn->close();
    exit();
}

$stmt->bind_param("sss", $user_id, $user_id, $user_id);
$stmt->execute();
$result = $stmt->get_result();

$teams = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $row['is_leader'] = (bool)intval($row['is_leader'] ?? 0);
        $teams[] = $row;
    }
    echo json_encode(["status" => "success", "data" => $teams]);
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $conn->error]);
}

$stmt->close();
$conn->close();
?>
