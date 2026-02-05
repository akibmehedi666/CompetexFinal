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
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
require_once __DIR__ . '/lib/notifications.php';

$data = json_decode(file_get_contents("php://input"), true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid JSON body"]);
    $conn->close();
    exit();
}

$session_id = isset($data["session_id"]) ? trim((string)$data["session_id"]) : '';
$mentor_user_id = isset($data["mentor_user_id"]) ? trim((string)$data["mentor_user_id"]) : '';
$start_time = isset($data["start_time"]) ? trim((string)$data["start_time"]) : null; // yyyy-mm-dd hh:mm:ss or yyyy-mm-ddThh:mm
$duration_minutes = isset($data["duration_minutes"]) ? (int)$data["duration_minutes"] : null;
$meet_link = isset($data["meet_link"]) ? trim((string)$data["meet_link"]) : null;
$status = isset($data["status"]) ? trim((string)$data["status"]) : null;
$notes = isset($data["notes"]) ? trim((string)$data["notes"]) : null;

if ($session_id === '' || $mentor_user_id === '') {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing session_id or mentor_user_id"]);
    $conn->close();
    exit();
}

$validStatuses = ['scheduled', 'live', 'completed', 'cancelled'];
if ($status !== null && !in_array($status, $validStatuses, true)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid status"]);
    $conn->close();
    exit();
}

// Expects schema to be provisioned from `competex_db.sql` (no table creation at runtime).

$updates = [];
$types = "";
$params = [];

if ($start_time !== null && $start_time !== '') {
    // normalize ISO 'T' to space
    $start_time = str_replace("T", " ", $start_time);
    $updates[] = "ms.start_time = ?";
    $types .= "s";
    $params[] = $start_time;
}
if ($duration_minutes !== null) {
    $updates[] = "ms.duration_minutes = ?";
    $types .= "i";
    $params[] = $duration_minutes;
}
if ($meet_link !== null) {
    $updates[] = "ms.meet_link = ?";
    $types .= "s";
    $params[] = $meet_link;
}
if ($status !== null) {
    $updates[] = "ms.status = ?";
    $types .= "s";
    $params[] = $status;
}
if ($notes !== null) {
    $updates[] = "ms.notes = ?";
    $types .= "s";
    $params[] = $notes;
}

if (count($updates) === 0) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "No fields to update"]);
    $conn->close();
    exit();
}

// SQL-enforced: mentor must own the session via mentor_profiles.user_id
$sql = "
    UPDATE mentorship_sessions ms
    JOIN mentor_profiles mp ON ms.mentor_id = mp.id
    JOIN users u ON mp.user_id = u.id
    SET " . implode(", ", $updates) . "
    WHERE ms.id = ?
      AND mp.user_id = ?
      AND u.role IN ('Mentor','mentor')
";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $conn->error]);
    $conn->close();
    exit();
}

$typesFinal = $types . "ss";
$paramsFinal = array_merge($params, [$session_id, $mentor_user_id]);
$stmt->bind_param($typesFinal, ...$paramsFinal);
$stmt->execute();
$affected = $stmt->affected_rows;
$stmt->close();

if ($affected === 0) {
    http_response_code(409);
    echo json_encode(["status" => "error", "message" => "Session not found or not owned by this mentor"]);
    $conn->close();
    exit();
}

// Notify mentee (best-effort)
$summaryBits = [];
if ($start_time !== null && $start_time !== '') $summaryBits[] = "time updated";
if ($duration_minutes !== null) $summaryBits[] = "duration updated";
if ($meet_link !== null) $summaryBits[] = "meet link updated";
if ($status !== null) $summaryBits[] = "status: {$status}";
$summary = count($summaryBits) > 0 ? (" (" . implode(", ", $summaryBits) . ")") : "";
$msg = "Mentorship session updated{$summary}.";

$stmtMentee = $conn->prepare("
    SELECT ms.mentee_id
    FROM mentorship_sessions ms
    JOIN mentor_profiles mp ON ms.mentor_id = mp.id
    WHERE ms.id = ?
      AND mp.user_id = ?
    LIMIT 1
");
if ($stmtMentee) {
    $stmtMentee->bind_param("ss", $session_id, $mentor_user_id);
    $stmtMentee->execute();
    $r = $stmtMentee->get_result();
    if ($r && $r->num_rows > 0) {
        $row = $r->fetch_assoc();
        $menteeId = (string)($row["mentee_id"] ?? "");
        if ($menteeId !== "") {
            competex_notify_user($conn, $menteeId, "mentorship_session_update", $msg, $session_id);
        }
    }
    $stmtMentee->close();
}

echo json_encode(["status" => "success", "message" => "Session updated"]);
$conn->close();
?>
