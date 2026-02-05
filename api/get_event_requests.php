<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'db_connect.php';

$event_id = isset($_GET['event_id']) ? $_GET['event_id'] : null;
$organizer_id = isset($_GET['organizer_id']) ? $_GET['organizer_id'] : null;

if (!$event_id && !$organizer_id) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing event_id or organizer_id"]);
    exit();
}

$sql = "SELECT er.*,
               t.name as team_name,
               u_leader.name as leader_name,
               u_part.name as participant_name,
               e.title as event_title,
               rf.full_name,
               rf.email,
               rf.phone,
               rf.university,
               rf.transaction_id,
               IFNULL(e.registration_fee, 0) as registration_fee
        FROM event_requests er
        LEFT JOIN events e ON er.event_id = e.id
        LEFT JOIN teams t ON er.team_id = t.id
        LEFT JOIN users u_leader ON t.leader_id = u_leader.id
        LEFT JOIN users u_part ON er.user_id = u_part.id
        LEFT JOIN event_registration_forms rf ON rf.request_id = er.id
        WHERE er.status = 'pending'";

if ($event_id) {
    $event_id = $conn->real_escape_string($event_id);
    $sql .= " AND er.event_id = '$event_id'";
} elseif ($organizer_id) {
    $organizer_id = $conn->real_escape_string($organizer_id);
    // Filter by events owned by organizer
    $sql .= " AND e.organizer_id = '$organizer_id'";
}

$sql .= " ORDER BY er.created_at DESC";

$result = $conn->query($sql);

$requests = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        // If team_name is set, it's a team request.
        // If not, it's an individual request (participant_name).
        $requests[] = $row;
    }
}

echo json_encode(["status" => "success", "data" => $requests]);
$conn->close();
?>
