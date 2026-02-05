<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db_connect.php';

if (!isset($_GET['event_id'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing event_id"]);
    exit();
}

$event_id = $_GET['event_id'];

$computedStatus = "CASE
    WHEN e.status = 'Live' THEN 'Live'
    WHEN e.start_date IS NOT NULL AND e.start_date <> '0000-00-00 00:00:00' THEN
        CASE WHEN e.start_date < NOW() THEN 'Ended' ELSE 'Upcoming' END
    WHEN e.status IN ('Ended','Completed') THEN 'Ended'
    ELSE e.status
END";

$sql = "SELECT e.id, e.title, e.description, e.category, e.mode, ($computedStatus) AS status,
               e.date_display as date, e.start_date, e.venue, e.max_participants,
               e.participants_count, e.image, e.prizes, e.tags, e.registration_type,
               e.max_teams, e.registration_deadline, e.contact_email, e.contact_phone,
               e.registration_fee,
               u.name as organizer, u.id as organizer_id, u.email as user_email
        FROM events e
        LEFT JOIN users u ON e.organizer_id = u.id
        WHERE e.id = ?
        LIMIT 1";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Statement preparation failed: " . $conn->error]);
    exit();
}

$stmt->bind_param("s", $event_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result && $result->num_rows > 0) {
    $row = $result->fetch_assoc();

    $row['prizes'] = json_decode($row['prizes']);
    $row['tags'] = json_decode($row['tags']);

    $row['startDate'] = $row['start_date'];
    $row['maxParticipants'] = (int) $row['max_participants'];
    $row['participantsCount'] = (int) $row['participants_count'];
    $row['registrationType'] = $row['registration_type'];
    $row['maxTeams'] = (int) $row['max_teams'];
    $row['registrationDeadline'] = $row['registration_deadline'];
    $row['registrationFee'] = isset($row['registration_fee']) ? (float) $row['registration_fee'] : 0.0;
    $row['organizerEmail'] = $row['contact_email'] ? $row['contact_email'] : $row['user_email'];
    $row['organizerPhone'] = $row['contact_phone'];
    $row['organizerId'] = $row['organizer_id'];

    unset($row['start_date']);
    unset($row['max_participants']);
    unset($row['participants_count']);
    unset($row['registration_type']);
    unset($row['max_teams']);
    unset($row['registration_deadline']);
    unset($row['registration_fee']);
    unset($row['contact_email']);
    unset($row['contact_phone']);
    unset($row['organizer_id']);
    unset($row['user_email']);

    echo json_encode(["status" => "success", "event" => $row]);
} else {
    http_response_code(404);
    echo json_encode(["status" => "error", "message" => "Event not found"]);
}

$stmt->close();
$conn->close();
?>
