<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db_connect.php';

$mentor_user_id = isset($_GET['mentor_user_id']) ? trim((string)$_GET['mentor_user_id']) : '';
if ($mentor_user_id === '') {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing mentor_user_id"]);
    $conn->close();
    exit();
}

// Expects schema to be provisioned from `competex_db.sql` (no table/column creation at runtime).

$sql = "
    SELECT
        ms.id,
        ms.request_id,
        ms.start_time,
        ms.duration_minutes,
        ms.meet_link,
        ms.status,
        ms.notes,
        mr.topic,
        mr.message,
        mp.id AS mentor_profile_id,
        mp.user_id AS mentor_user_id,
        COALESCE(mp.name, u_mentor.name) AS mentor_name,
        u_mentee.id AS mentee_id,
        u_mentee.name AS mentee_name,
        u_mentee.avatar AS mentee_avatar,
        u_mentee.university AS mentee_university
    FROM mentorship_sessions ms
    JOIN mentor_profiles mp ON ms.mentor_id = mp.id
    JOIN users u_mentor ON u_mentor.id = mp.user_id
    JOIN users u_mentee ON u_mentee.id = ms.mentee_id
    LEFT JOIN mentorship_requests mr ON mr.id = ms.request_id
    WHERE mp.user_id = ?
      AND u_mentor.role IN ('Mentor','mentor')
    ORDER BY
        (ms.start_time IS NULL) DESC,
        ms.start_time DESC,
        ms.created_at DESC
";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $conn->error]);
    $conn->close();
    exit();
}

$stmt->bind_param("s", $mentor_user_id);
$stmt->execute();
$res = $stmt->get_result();
$rows = [];
while ($res && ($row = $res->fetch_assoc())) {
    $rows[] = $row;
}

echo json_encode(["status" => "success", "data" => $rows]);
$stmt->close();
$conn->close();
?>
