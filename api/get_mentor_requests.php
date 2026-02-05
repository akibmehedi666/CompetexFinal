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
$status = isset($_GET['status']) ? trim((string)$_GET['status']) : 'pending';

if ($mentor_user_id === '') {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing mentor_user_id"]);
    $conn->close();
    exit();
}

$validStatuses = ['pending', 'accepted', 'rejected'];
$filterStatus = in_array($status, $validStatuses, true) ? $status : 'pending';

// Expects schema to be provisioned from competex_db.sql (no table/column creation at runtime).

$sql = "
    SELECT
        mr.id,
        mr.status,
        mr.created_at,
        mr.message,
        mr.topic,
        mr.proposed_slots,
        mp.id AS mentor_profile_id,
        mp.user_id AS mentor_user_id,
        COALESCE(mp.name, u_mentor.name) AS mentor_name,
        u_mentee.id AS mentee_id,
        u_mentee.name AS mentee_name,
        u_mentee.avatar AS mentee_avatar,
        u_mentee.university AS mentee_university,
        u_mentee.skills AS mentee_skills
    FROM mentorship_requests mr
    JOIN mentor_profiles mp ON mr.mentor_id = mp.id
    JOIN users u_mentor ON u_mentor.id = mp.user_id
    JOIN users u_mentee ON u_mentee.id = mr.mentee_id
    WHERE mp.user_id = ?
      AND u_mentor.role IN ('Mentor','mentor')
      AND mr.status = ?
    ORDER BY mr.created_at DESC
";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $conn->error]);
    $conn->close();
    exit();
}

$stmt->bind_param("ss", $mentor_user_id, $filterStatus);
$stmt->execute();
$res = $stmt->get_result();

$rows = [];
while ($res && ($row = $res->fetch_assoc())) {
    $slots = [];
    if (!empty($row["proposed_slots"])) {
        $decoded = json_decode($row["proposed_slots"], true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            $slots = $decoded;
        }
    }
    $row["proposed_slots"] = $slots;

    $skills = [];
    if (!empty($row["mentee_skills"])) {
        $decodedSkills = json_decode($row["mentee_skills"], true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decodedSkills)) {
            $skills = $decodedSkills;
        }
    }
    $row["mentee_skills"] = $skills;
    $rows[] = $row;
}

echo json_encode(["status" => "success", "data" => $rows]);

$stmt->close();
$conn->close();
?>
