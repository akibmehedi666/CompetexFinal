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

$request_id = isset($data["request_id"]) ? trim((string)$data["request_id"]) : '';
$mentor_user_id = isset($data["mentor_user_id"]) ? trim((string)$data["mentor_user_id"]) : '';
$action = isset($data["action"]) ? trim((string)$data["action"]) : '';

if ($request_id === '' || $mentor_user_id === '' || $action === '') {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing request_id, mentor_user_id, or action"]);
    $conn->close();
    exit();
}

if (!in_array($action, ['accept', 'reject'], true)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid action"]);
    $conn->close();
    exit();
}

$newStatus = $action === 'accept' ? 'accepted' : 'rejected';
// Expects schema to be provisioned from `competex_db.sql` (no table/column creation at runtime).

$conn->begin_transaction();
try {
    // Atomic, SQL-enforced ownership + pending-only transition
    $updateSql = "
        UPDATE mentorship_requests mr
        JOIN mentor_profiles mp ON mr.mentor_id = mp.id
        JOIN users u ON mp.user_id = u.id
        SET mr.status = ?
        WHERE mr.id = ?
          AND mp.user_id = ?
          AND u.role IN ('Mentor','mentor')
          AND mr.status = 'pending'
    ";
    $stmtU = $conn->prepare($updateSql);
    $stmtU->bind_param("sss", $newStatus, $request_id, $mentor_user_id);
    $stmtU->execute();
    $affected = $stmtU->affected_rows;
    $stmtU->close();

    if ($affected === 0) {
        $conn->rollback();
        http_response_code(409);
        echo json_encode(["status" => "error", "message" => "Request not found, not pending, or not owned by this mentor"]);
        $conn->close();
        exit();
    }

    if ($newStatus === 'accepted') {
        // Create a session row tied to this request (no schedule yet)
        $insertSql = "
            INSERT INTO mentorship_sessions (id, request_id, mentor_id, mentee_id, status)
            SELECT
                UUID(),
                mr.id,
                mr.mentor_id,
                mr.mentee_id,
                'scheduled'
            FROM mentorship_requests mr
            JOIN mentor_profiles mp ON mr.mentor_id = mp.id
            WHERE mr.id = ?
              AND mp.user_id = ?
            LIMIT 1
        ";
        $stmtI = $conn->prepare($insertSql);
        $stmtI->bind_param("ss", $request_id, $mentor_user_id);
        $stmtI->execute();
        $stmtI->close();
    }

    // Mark mentor's request notification as read (best-effort)
    competex_mark_notification_read($conn, $mentor_user_id, "mentorship_request", $request_id);

    // Notify mentee (best-effort)
    $selectNotif = "
        SELECT
            mr.mentee_id AS user_id,
            mr.id AS reference_id,
            CASE
                WHEN mr.status = 'accepted' THEN CONCAT('Your mentorship request was accepted by ', COALESCE(mp.name, u.name), '.')
                WHEN mr.status = 'rejected' THEN CONCAT('Your mentorship request was rejected by ', COALESCE(mp.name, u.name), '.')
                ELSE 'Your mentorship request was updated.'
            END AS message
        FROM mentorship_requests mr
        JOIN mentor_profiles mp ON mp.id = mr.mentor_id
        JOIN users u ON u.id = mp.user_id
        WHERE mr.id = ?
        LIMIT 1
    ";
    competex_notify_from_select_mysqli($conn, $selectNotif, "s", [$request_id], "mentorship_request_result");

    $conn->commit();
    echo json_encode(["status" => "success", "message" => "Request {$newStatus}"]);
} catch (mysqli_sql_exception $e) {
    $conn->rollback();
    if ((int)$e->getCode() === 1062) {
        // Duplicate uniq_request (session already created)
        echo json_encode(["status" => "success", "message" => "Request {$newStatus}"]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
    }
} finally {
    $conn->close();
}
?>
