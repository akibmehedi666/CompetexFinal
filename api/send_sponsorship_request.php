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

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->organizer_id) || !isset($data->sponsor_id) || !isset($data->event_id) || !isset($data->requested_amount)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing organizer_id, sponsor_id, event_id, or requested_amount"]);
    exit();
}

$organizer_id = trim((string)$data->organizer_id);
$sponsor_id_raw = trim((string)$data->sponsor_id); // users.id OR sponsor_profiles.id
$event_id = trim((string)$data->event_id);
$requested_amount = is_numeric($data->requested_amount) ? (float)$data->requested_amount : 0.0;
$message = isset($data->message) ? trim((string)$data->message) : null;

if ($requested_amount <= 0) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid requested_amount"]);
    exit();
}

// Expects schema to be provisioned from `competex_db.sql` (no table creation at runtime).
$id = competex_uuidv4();
$created_at = date("Y-m-d H:i:s");
$msg = ($message === "" ? null : $message);

// SQL-level enforcement:
// - event ownership: event must belong to organizer
// - sponsor existence: sponsor_profiles id must resolve (by id or user_id)
// - duplicates prevented by unique constraint
$sql = "
    INSERT INTO sponsorship_requests (id, organizer_id, sponsor_id, event_id, requested_amount, message, status, created_at)
    SELECT
        ?,
        e.organizer_id,
        sp.id,
        e.id,
        ?,
        ?,
        'pending',
        ?
    FROM events e
    JOIN sponsor_profiles sp ON (sp.id = ? OR sp.user_id = ?)
    WHERE e.id = ? AND e.organizer_id = ?
";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $conn->error]);
    exit();
}

$stmt->bind_param(
    "sdssssss",
    $id,
    $requested_amount,
    $msg,
    $created_at,
    $sponsor_id_raw,
    $sponsor_id_raw,
    $event_id,
    $organizer_id
);

$conn->begin_transaction();
try {
    $ok = $stmt->execute();
    $affected = $stmt->affected_rows;
    $stmt->close();

    if (!$ok || $affected === 0) {
        $conn->rollback();
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid sponsor/event, or you don't own this event."]);
        $conn->close();
        exit();
    }

    // Notify sponsor (best-effort)
    $selectNotif = "
        SELECT
            sp.user_id AS user_id,
            sr.id AS reference_id,
            CONCAT('New sponsorship request for \"', e.title, '\" from ', u.name, '.') AS message
        FROM sponsorship_requests sr
        JOIN sponsor_profiles sp ON sp.id = sr.sponsor_id
        JOIN events e ON e.id = sr.event_id
        JOIN users u ON u.id = sr.organizer_id
        WHERE sr.id = ?
        LIMIT 1
    ";
    competex_notify_from_select_mysqli($conn, $selectNotif, "s", [$id], "sponsorship_request");

    $conn->commit();
    echo json_encode(["status" => "success", "message" => "Sponsorship request sent.", "id" => $id]);
} catch (mysqli_sql_exception $e) {
    $conn->rollback();
    if ((int)$conn->errno === 1062) {
        http_response_code(409);
        echo json_encode(["status" => "error", "message" => "Duplicate request: you already requested this sponsor for this event."]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
    }
}

$conn->close();
?>
