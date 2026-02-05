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

if (!isset($data->request_id) || !isset($data->status)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing request_id or status"]);
    exit();
}

$request_id = $conn->real_escape_string($data->request_id);
$status = $conn->real_escape_string($data->status);

if (!in_array($status, ['approved', 'rejected'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid status. Must be 'approved' or 'rejected'"]);
    exit();
}

$sql = "UPDATE event_requests SET status = '$status' WHERE id = '$request_id'";

if ($conn->query($sql)) {
    echo json_encode(["status" => "success", "message" => "Request updated successfully"]);
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $conn->error]);
}

$conn->close();
?>