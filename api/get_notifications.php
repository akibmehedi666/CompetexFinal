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

$user_id = isset($_GET['user_id']) ? trim($_GET['user_id']) : '';

if ($user_id === '') {
    $sql = "SELECT id, title, content, priority, created_at
            FROM announcements
            ORDER BY created_at DESC";

    $result = $conn->query($sql);
    $notifications = [];

    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $notifications[] = $row;
        }
        echo json_encode(["status" => "success", "data" => $notifications]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database error: " . $conn->error]);
    }

    $conn->close();
    exit();
}

// If user_id is provided: return announcements + user notifications (invites, etc.)
// Expects schema to be provisioned from competex_db.sql (no table/column creation at runtime).

$sql = "
    SELECT * FROM (
        SELECT
            id,
            title,
            content,
            priority,
            created_at,
            0 AS is_read,
            'announcement' AS notif_type,
            NULL AS reference_id
        FROM announcements
        UNION ALL
        SELECT
            id,
            CASE
                WHEN type = 'invite' THEN 'Team Invitation'
                WHEN type = 'invite_result' THEN 'Team Invitation Update'
                WHEN type = 'team_join_request' THEN 'Team Join Request'
                WHEN type = 'team_join_request_result' THEN 'Team Join Update'
                WHEN type = 'event_registration' THEN 'New Registration'
                WHEN type = 'event_registration_result' THEN 'Registration Update'
                WHEN type = 'event_join_request' THEN 'Event Join Request'
                WHEN type = 'event_schedule_update' THEN 'Event Update'
                WHEN type = 'sponsorship_request' THEN 'Sponsorship Request'
                WHEN type = 'sponsorship_request_result' THEN 'Sponsorship Request Update'
                WHEN type = 'job_application' THEN 'New Job Application'
                WHEN type = 'mentorship_request' THEN 'Mentorship Request'
                WHEN type = 'mentorship_request_result' THEN 'Mentorship Update'
                WHEN type = 'mentorship_session_update' THEN 'Mentorship Session'
                WHEN type = 'team_member_removed' THEN 'Team Update'
                ELSE 'Notification'
            END AS title,
            message AS content,
            CASE
                WHEN type IN ('invite', 'team_join_request', 'event_registration', 'event_join_request', 'sponsorship_request', 'job_application', 'mentorship_request') THEN 'high'
                WHEN type IN ('invite_result', 'team_join_request_result', 'event_registration_result', 'sponsorship_request_result', 'mentorship_request_result') THEN 'medium'
                WHEN type IN ('mentorship_session_update', 'event_schedule_update', 'team_member_removed') THEN 'low'
                ELSE 'medium'
            END AS priority,
            created_at,
            is_read,
            type AS notif_type,
            reference_id
        FROM notifications
        WHERE user_id = ?
    ) AS n
    ORDER BY created_at DESC
    LIMIT 50
";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $conn->error]);
    $conn->close();
    exit();
}

$stmt->bind_param("s", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$notifications = [];
while ($row = $result->fetch_assoc()) {
    $notifications[] = $row;
}

echo json_encode(["status" => "success", "data" => $notifications]);

$stmt->close();
$conn->close();
?>
