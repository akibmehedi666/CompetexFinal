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

if (!isset($data->event_id) || !isset($data->user_id)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing event_id or user_id"]);
    exit();
}

$event_id = $conn->real_escape_string((string)$data->event_id);
$user_id = $conn->real_escape_string((string)$data->user_id);
$team_id = isset($data->team_id) && $data->team_id !== null && $data->team_id !== "" ? $conn->real_escape_string((string)$data->team_id) : null;

$full_name = isset($data->full_name) ? trim((string)$data->full_name) : "";
$email = isset($data->email) ? trim((string)$data->email) : "";
$phone = isset($data->phone) ? trim((string)$data->phone) : null;
$university = isset($data->university) ? trim((string)$data->university) : null;
$transaction_id = isset($data->transaction_id) ? trim((string)$data->transaction_id) : null;

if ($full_name === "" || $email === "") {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing full_name or email"]);
    exit();
}

// Get event metadata (fee + organizer)
$eventMeta = $conn->query("SELECT id, title, organizer_id, IFNULL(registration_fee, 0) AS registration_fee FROM events WHERE id = '$event_id' LIMIT 1");
if (!$eventMeta || $eventMeta->num_rows === 0) {
    http_response_code(404);
    echo json_encode(["status" => "error", "message" => "Event not found"]);
    $conn->close();
    exit();
}
$eventRow = $eventMeta->fetch_assoc();
$registration_fee = floatval($eventRow['registration_fee'] ?? 0);
$organizer_id = $eventRow['organizer_id'] ?? null;
$event_title = $eventRow['title'] ?? "an event";

if ($registration_fee > 0 && (!$transaction_id || $transaction_id === "")) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Transaction ID is required for paid events."]);
    $conn->close();
    exit();
}

// Prevent duplicate requests (same logic as request_event_join.php, but using form submit)
$check_sql = "SELECT id FROM event_requests WHERE event_id='$event_id' AND (user_id='$user_id' OR (team_id IS NOT NULL AND team_id='" . ($team_id ? $team_id : "") . "'))";
if ($team_id === null) {
    $check_sql = "SELECT id FROM event_requests WHERE event_id='$event_id' AND user_id='$user_id'";
}

$check = $conn->query($check_sql);
if ($check && $check->num_rows > 0) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Request already pending or approved"]);
    $conn->close();
    exit();
}

$request_id = uniqid('req_');
$created_at = date("Y-m-d H:i:s");

$sql = "INSERT INTO event_requests (id, event_id, team_id, user_id, status, created_at)
        VALUES ('$request_id', '$event_id', " . ($team_id === null ? "NULL" : "'$team_id'") . ", '$user_id', 'pending', '$created_at')";

$conn->begin_transaction();

try {
    if (!$conn->query($sql)) {
        throw new Exception("Database error: " . $conn->error);
    }

    $form_id = uniqid("reg_");
    $stmt = $conn->prepare("INSERT INTO event_registration_forms (id, request_id, event_id, user_id, team_id, full_name, email, phone, university, transaction_id)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    if (!$stmt) {
        throw new Exception("Database error: " . $conn->error);
    }

    $team_id_param = $team_id;
    $phone_param = $phone;
    $university_param = $university;
    $transaction_param = $transaction_id;

    $stmt->bind_param(
        "ssssssssss",
        $form_id,
        $request_id,
        $event_id,
        $user_id,
        $team_id_param,
        $full_name,
        $email,
        $phone_param,
        $university_param,
        $transaction_param
    );

    if (!$stmt->execute()) {
        $stmt->close();
        throw new Exception("Database error: " . $stmt->error);
    }
    $stmt->close();

    // Optional notification to organizer
    if ($organizer_id) {
        $msg = "New registration pending for \"{$event_title}\" from {$full_name}.";
        competex_notify_user($conn, (string)$organizer_id, "event_registration", $msg, (string)$request_id, (string)$created_at);
    }

    $conn->commit();

    echo json_encode([
        "status" => "success",
        "message" => "Registration submitted successfully. Awaiting organizer approval.",
        "request_id" => $request_id
    ]);
} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}

$conn->close();
?>
