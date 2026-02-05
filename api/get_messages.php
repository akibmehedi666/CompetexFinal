<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db_connect.php';

$user_id = isset($_GET['user_id']) ? $conn->real_escape_string($_GET['user_id']) : null;
$other_id = isset($_GET['other_id']) ? $conn->real_escape_string($_GET['other_id']) : null;

if (!$user_id || !$other_id) {
    echo json_encode([]);
    exit;
}

$sql = "SELECT id, sender_id, content, created_at, is_read 
        FROM messages 
        WHERE (sender_id = '$user_id' AND recipient_id = '$other_id') 
           OR (sender_id = '$other_id' AND recipient_id = '$user_id')
        ORDER BY created_at ASC";

$result = $conn->query($sql);
$messages = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $messages[] = [
            "id" => $row['id'],
            "senderId" => $row['sender_id'],
            "text" => $row['content'],
            "time" => date("g:i A", strtotime($row['created_at'])),
            "isMe" => ($row['sender_id'] === $user_id),
            "status" => $row['is_read'] ? 'read' : 'sent'
        ];
    }
}

echo json_encode($messages);
$conn->close();
?>