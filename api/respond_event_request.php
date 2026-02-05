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

if (!isset($data->request_id) || !isset($data->action)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing request_id or action"]);
    exit();
}

$request_id = $conn->real_escape_string($data->request_id);
$action = $conn->real_escape_string($data->action); // 'approved' or 'rejected'
$provided_transaction_id = isset($data->transaction_id) ? trim((string)$data->transaction_id) : "";

if (!in_array($action, ['approved', 'rejected'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid action"]);
    exit();
}

$uuid = function(): string {
    return sprintf(
        '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0xffff)
    );
};

// Load request + registration form + event payment requirement
$metaSql = "SELECT
                er.id,
                er.event_id,
                er.team_id,
                er.user_id,
                e.title AS event_title,
                IFNULL(e.registration_fee, 0) AS registration_fee,
                rf.transaction_id
            FROM event_requests er
            LEFT JOIN events e ON er.event_id = e.id
            LEFT JOIN event_registration_forms rf ON rf.request_id = er.id
            WHERE er.id = '$request_id'
            LIMIT 1";

$metaRes = $conn->query($metaSql);
if (!$metaRes || $metaRes->num_rows === 0) {
    http_response_code(404);
    echo json_encode(["status" => "error", "message" => "Request not found"]);
    $conn->close();
    exit();
}
$meta = $metaRes->fetch_assoc();
$event_id = $meta['event_id'];
$team_id = $meta['team_id'];
$user_id = $meta['user_id'];
$event_title = $meta['event_title'] ?? "the event";
$registration_fee = floatval($meta['registration_fee'] ?? 0);
$transaction_id = isset($meta['transaction_id']) ? trim((string)$meta['transaction_id']) : "";

if ($action === 'approved' && $registration_fee > 0 && $transaction_id === "") {
    // Allow organizer to provide missing transaction_id at approval time
    if ($provided_transaction_id !== "") {
        $safeTx = $conn->real_escape_string($provided_transaction_id);
        $conn->query("UPDATE event_registration_forms SET transaction_id = '$safeTx' WHERE request_id = '$request_id' LIMIT 1");
        $transaction_id = $provided_transaction_id;
    }

    if ($transaction_id === "") {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Cannot approve: Transaction ID is missing for this paid event."]);
        $conn->close();
        exit();
    }
}

$conn->begin_transaction();
try {
    // 1) Update request status
    $sql = "UPDATE event_requests SET status = '$action' WHERE id = '$request_id'";
    if (!$conn->query($sql)) {
        throw new Exception("Database error: " . $conn->error);
    }

    if ($action === 'approved') {
        if ($team_id) {
            $enroll_id = uniqid('enr_');
            $check = $conn->query("SELECT id FROM event_teams WHERE event_id='$event_id' AND team_id='$team_id' LIMIT 1");
            if ($check && $check->num_rows == 0) {
                $conn->query("INSERT INTO event_teams (id, event_id, team_id) VALUES ('$enroll_id', '$event_id', '$team_id')");
            }

            $check_reg = $conn->query("SELECT id FROM event_registrations WHERE event_id='$event_id' AND team_id='$team_id' LIMIT 1");
            if (!$check_reg || $check_reg->num_rows == 0) {
                $reg_id = $uuid();
                $txVal = $transaction_id !== "" ? ("'" . $conn->real_escape_string($transaction_id) . "'") : "NULL";
                $conn->query("INSERT INTO event_registrations (id, event_id, user_id, team_id, transaction_id, status) VALUES ('$reg_id', '$event_id', '$user_id', '$team_id', $txVal, 'approved')");
            }
        } else {
            $check = $conn->query("SELECT id FROM event_participants WHERE event_id='$event_id' AND user_id='$user_id' LIMIT 1");
            if ($check && $check->num_rows == 0) {
                $part_id = uniqid('part_');
                $conn->query("INSERT INTO event_participants (id, event_id, user_id) VALUES ('$part_id', '$event_id', '$user_id')");
            }

            $check_reg = $conn->query("SELECT id FROM event_registrations WHERE event_id='$event_id' AND user_id='$user_id' LIMIT 1");
            if (!$check_reg || $check_reg->num_rows == 0) {
                $reg_id = $uuid();
                $txVal = $transaction_id !== "" ? ("'" . $conn->real_escape_string($transaction_id) . "'") : "NULL";
                $conn->query("INSERT INTO event_registrations (id, event_id, user_id, team_id, transaction_id, status) VALUES ('$reg_id', '$event_id', '$user_id', NULL, $txVal, 'approved')");
            }
        }

        // Keep events.participants_count consistent even if triggers aren't installed
        $cntRes = $conn->query("SELECT COUNT(*) AS c FROM event_registrations WHERE event_id='$event_id'");
        if ($cntRes && $cntRes->num_rows > 0) {
            $cRow = $cntRes->fetch_assoc();
            $count = intval($cRow['c'] ?? 0);
            $conn->query("UPDATE events SET participants_count = $count WHERE id = '$event_id'");
        }

        // Participant notification
        if (!empty($user_id)) {
            $msg = "Your registration for \"{$event_title}\" was approved.";
            competex_notify_user($conn, (string)$user_id, "event_registration_result", $msg, (string)$request_id);
        }
    } else {
        if (!empty($user_id)) {
            $msg = "Your registration for \"{$event_title}\" was rejected.";
            competex_notify_user($conn, (string)$user_id, "event_registration_result", $msg, (string)$request_id);
        }
    }

    $conn->commit();
    echo json_encode(["status" => "success", "message" => "Request $action successfully"]);
} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}

$conn->close();
?>
