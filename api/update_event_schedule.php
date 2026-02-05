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

if (!isset($data->event_id) || !isset($data->start_date) || !isset($data->date_display)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    exit();
}

$event_id = $conn->real_escape_string($data->event_id);
$start_date = $conn->real_escape_string($data->start_date); // Expecting YYYY-MM-DD HH:MM:SS
$date_display = $conn->real_escape_string($data->date_display); // e.g., "Jan 24, 2026"

// Update event schedule
$sql = "UPDATE events SET start_date = '$start_date', date_display = '$date_display' WHERE id = '$event_id'";

if ($conn->query($sql)) {
    // Notify registered participants (best-effort)
    $selectNotif = "
        SELECT DISTINCT
            r.user_id AS user_id,
            e.id AS reference_id,
            CONCAT('Schedule updated for \"', e.title, '\": ', e.date_display) AS message
        FROM events e
        JOIN (
            SELECT ep.user_id
            FROM event_participants ep
            WHERE ep.event_id = ?
            UNION
            SELECT er.user_id
            FROM event_registrations er
            WHERE er.event_id = ? AND er.status = 'approved' AND er.user_id IS NOT NULL
            UNION
            SELECT tm.user_id
            FROM event_teams et
            JOIN team_members tm ON tm.team_id = et.team_id
            WHERE et.event_id = ?
        ) r ON 1=1
        WHERE e.id = ?
          AND r.user_id IS NOT NULL
    ";
    competex_notify_from_select_mysqli($conn, $selectNotif, "ssss", [$event_id, $event_id, $event_id, $event_id], "event_schedule_update");

    echo json_encode(["status" => "success", "message" => "Event schedule updated successfully"]);
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $conn->error]);
}

$conn->close();
?>
