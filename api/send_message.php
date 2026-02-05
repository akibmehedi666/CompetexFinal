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

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['sender_id']) || !isset($data['recipient_id']) || !isset($data['content'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing fields"]);
    exit;
}

$sender_id = $conn->real_escape_string($data['sender_id']);
$recipient_id = $conn->real_escape_string($data['recipient_id']);
$content = $conn->real_escape_string($data['content']);
$id = uniqid('msg_');

$sql = "INSERT INTO messages (id, sender_id, recipient_id, content) VALUES ('$id', '$sender_id', '$recipient_id', '$content')";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["status" => "success", "id" => $id]);
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $conn->error]);
}

$conn->close();
?>