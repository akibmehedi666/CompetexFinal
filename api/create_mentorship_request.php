<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db_connect.php';
require_once __DIR__ . '/lib/notifications.php';

$data = json_decode(file_get_contents("php://input"), true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid JSON body"]);
    $conn->close();
    exit();
}

$mentor_profile_id = isset($data["mentor_profile_id"]) ? trim((string)$data["mentor_profile_id"]) : '';
$mentee_id = isset($data["mentee_id"]) ? trim((string)$data["mentee_id"]) : '';
$message = isset($data["message"]) ? trim((string)$data["message"]) : '';
$topic = isset($data["topic"]) ? trim((string)$data["topic"]) : '';
$proposed_slots = isset($data["proposed_slots"]) && is_array($data["proposed_slots"]) ? $data["proposed_slots"] : [];

if ($mentor_profile_id === '' || $mentee_id === '' || $message === '') {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing mentor_profile_id, mentee_id, or message"]);
    $conn->close();
    exit();
}

// Expects schema to be provisioned from `competex_db.sql` (no table/column creation at runtime).

$slotsJson = json_encode(array_values(array_filter(array_map(function($s) { return trim((string)$s); }, $proposed_slots), function($s) { return $s !== ''; })));
if ($slotsJson === false) $slotsJson = "[]";

$request_id = competex_uuidv4();

// SQL-enforced authorization:
// - mentee must be a Participant
// - mentor_profile_id must belong to a Mentor user
// Insert request in one statement (no PHP ownership bypass)
$sql = "
    INSERT INTO mentorship_requests (id, mentor_id, mentee_id, status, created_at, message, topic, proposed_slots)
    SELECT
        ?,
        mp.id,
        u_mentee.id,
        'pending',
        CURRENT_TIMESTAMP,
        ?,
        NULLIF(?, ''),
        ?
    FROM mentor_profiles mp
    JOIN users u_mentor ON u_mentor.id = mp.user_id AND u_mentor.role IN ('Mentor','mentor')
    JOIN users u_mentee ON u_mentee.id = ? AND u_mentee.role IN ('Participant','participant')
    WHERE mp.id = ?
";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $conn->error]);
    $conn->close();
    exit();
}

$conn->begin_transaction();
try {
    $stmt->bind_param("ssssss", $request_id, $message, $topic, $slotsJson, $mentee_id, $mentor_profile_id);
    $stmt->execute();
    $affected = $stmt->affected_rows;
    $stmt->close();

    if ($affected === 0) {
        $conn->rollback();
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Access denied or mentor not found"]);
        $conn->close();
        exit();
    }

    // Notify mentor (best-effort)
    $selectNotif = "
        SELECT
            mp.user_id AS user_id,
            mr.id AS reference_id,
            CONCAT('New mentorship request from ', u.name, IF(mr.topic IS NULL OR mr.topic = '', '.', CONCAT(' about \"', mr.topic, '\".'))) AS message
        FROM mentorship_requests mr
        JOIN mentor_profiles mp ON mp.id = mr.mentor_id
        JOIN users u ON u.id = mr.mentee_id
        WHERE mr.id = ?
        LIMIT 1
    ";
    competex_notify_from_select_mysqli($conn, $selectNotif, "s", [$request_id], "mentorship_request");

    $conn->commit();
    echo json_encode(["status" => "success", "message" => "Mentorship request sent", "request_id" => $request_id]);
} catch (mysqli_sql_exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
} finally {
    $conn->close();
}
?>
