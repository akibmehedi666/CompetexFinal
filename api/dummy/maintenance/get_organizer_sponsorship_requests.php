<?php
// (maintenance) moved out of production API endpoints.
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'db_connect.php';

$organizer_id = isset($_GET['organizer_id']) ? $conn->real_escape_string($_GET['organizer_id']) : null;

if (!$organizer_id) {
    echo json_encode(["status" => "error", "message" => "Missing organizer_id"]);
    exit();
}

// Fetch pending requests for organizer-owned events.
$sql = "SELECT
            sa.id,
            sa.event_id,
            sa.sponsor_id,
            sa.amount,
            sa.contact_email,
            sa.contact_phone,
            sa.message,
            sa.status,
            sa.created_at,
            e.title AS event_title,
            sp.company_name,
            sp.industry,
            sp.user_id AS sponsor_user_id,
            COALESCE(sp.company_name, u.name) AS sponsor_name
        FROM sponsorship_applications sa
        INNER JOIN events e ON sa.event_id = e.id
        LEFT JOIN sponsor_profiles sp ON sa.sponsor_id = sp.id
        LEFT JOIN users u ON sp.user_id = u.id
        WHERE e.organizer_id = ? AND sa.status = 'pending'
        ORDER BY sa.created_at DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $organizer_id);
$stmt->execute();
$result = $stmt->get_result();
$requests = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $requests[] = $row;
    }
}

echo json_encode([
    "status" => "success",
    "data" => $requests
]);

$stmt->close();
$conn->close();
?>
