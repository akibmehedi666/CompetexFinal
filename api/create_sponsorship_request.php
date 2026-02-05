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

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->sponsor_id) || !isset($data->event_id) || !isset($data->amount) || !isset($data->contact_email) || !isset($data->contact_phone)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    exit();
}

$sponsor_id_raw = trim((string)$data->sponsor_id); // user_id OR sponsor_profile_id (we resolve to sponsor_profiles.id)
$event_id = trim((string)$data->event_id);
$amount_raw = $data->amount;
$contact_email = trim((string)$data->contact_email);
$contact_phone = trim((string)$data->contact_phone);
$message = isset($data->message) ? trim((string)$data->message) : null;

// Validate amount
$amount = is_numeric($amount_raw) ? (float)$amount_raw : 0;
if ($amount <= 0) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid amount"]);
    exit();
}

// Validate email/phone
if (!filter_var($contact_email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid email"]);
    exit();
}

if (!preg_match('/^[0-9]{7,15}$/', $contact_phone)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid phone number"]);
    exit();
}

// Resolve sponsor_id to sponsor_profiles.id (accept sponsor_profiles.id or users.id)
$sponsor_id = null;
$stmt = $conn->prepare("SELECT id FROM sponsor_profiles WHERE id = ? LIMIT 1");
$stmt->bind_param("s", $sponsor_id_raw);
$stmt->execute();
$res = $stmt->get_result();
if ($res && $res->num_rows > 0) {
    $sponsor_id = $sponsor_id_raw;
}
$stmt->close();

if (!$sponsor_id) {
    $stmt = $conn->prepare("SELECT id FROM sponsor_profiles WHERE user_id = ? LIMIT 1");
    $stmt->bind_param("s", $sponsor_id_raw);
    $stmt->execute();
    $res = $stmt->get_result();
    if ($res && $res->num_rows > 0) {
        $row = $res->fetch_assoc();
        $sponsor_id = $row['id'];
    }
    $stmt->close();
}

if (!$sponsor_id) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Sponsor profile not found. Please create a profile first."]);
    exit();
}

// Check for duplicate pending requests (same sponsor + event)
$stmt = $conn->prepare("SELECT id FROM sponsorship_applications WHERE event_id = ? AND sponsor_id = ? AND status = 'pending' LIMIT 1");
$stmt->bind_param("ss", $event_id, $sponsor_id);
$stmt->execute();
$dup = $stmt->get_result();
$hasDup = ($dup && $dup->num_rows > 0);
$stmt->close();

if ($hasDup) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "You already have a pending request for this event."]);
    exit();
}

// UUIDv4 for consistency with CHAR(36) ids across the schema.
function uuidv4(): string {
    $data = random_bytes(16);
    $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
    $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

$id = uuidv4();

$stmt = $conn->prepare("INSERT INTO sponsorship_applications (id, event_id, sponsor_id, status, amount, contact_email, contact_phone, message)
                        VALUES (?, ?, ?, 'pending', ?, ?, ?, ?)");
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $conn->error]);
    exit();
}

$msg = ($message === "" || $message === null) ? null : $message;
$stmt->bind_param("sssdsss", $id, $event_id, $sponsor_id, $amount, $contact_email, $contact_phone, $msg);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Sponsorship request sent successfully"]);
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
