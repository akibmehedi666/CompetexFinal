<?php
// (maintenance) moved out of production API endpoints.
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

if (!isset($data->request_id) || !isset($data->action) || !isset($data->organizer_id)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing request_id, action, or organizer_id"]);
    exit();
}

$request_id = $conn->real_escape_string($data->request_id);
$action = $conn->real_escape_string($data->action); // 'accepted' or 'rejected'
$organizer_id = $conn->real_escape_string($data->organizer_id);

if (!in_array($action, ['accepted', 'rejected'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid action"]);
    exit();
}

$sql = "UPDATE sponsorship_applications sa
        INNER JOIN events e ON sa.event_id = e.id
        SET sa.status = ?
        WHERE sa.id = ? AND sa.status = 'pending' AND e.organizer_id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("sss", $action, $request_id, $organizer_id);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode(["status" => "success", "message" => "Request $action successfully"]);
} else {
    http_response_code(409);
    echo json_encode(["status" => "error", "message" => "Request not found, not pending, or not owned by this organizer"]);
}

$stmt->close();

$conn->close();
?>
