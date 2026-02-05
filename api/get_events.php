<?php
// Include the database connection file
require_once 'db_connect.php';

// Set headers to allow cross-origin requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// SQL query to fetch events
// We join with the 'users' table to get the name of the organizer using 'organizer_id'
// We select all fields from 'events' and the 'name' from 'users' aliased as 'organizer'
$scope = isset($_GET['scope']) ? trim((string)$_GET['scope']) : 'active'; // active|all|archive

// Computed status is date-aware:
// - Live stays Live
// - If start_date is valid, it controls Upcoming vs Ended
// - Otherwise fall back to stored status
$computedStatus = "CASE
    WHEN e.status = 'Live' THEN 'Live'
    WHEN e.start_date IS NOT NULL AND e.start_date <> '0000-00-00 00:00:00' THEN
        CASE WHEN e.start_date < NOW() THEN 'Ended' ELSE 'Upcoming' END
    WHEN e.status IN ('Ended','Completed') THEN 'Ended'
    ELSE e.status
END";

$where = "1=1";
$orderBy = "ORDER BY
    (e.start_date IS NULL OR e.start_date = '0000-00-00 00:00:00') ASC,
    e.start_date ASC";

if ($scope === 'active') {
    $where = "(
        e.status = 'Live'
        OR (e.start_date IS NOT NULL AND e.start_date <> '0000-00-00 00:00:00' AND e.start_date >= NOW())
        OR ((e.start_date IS NULL OR e.start_date = '0000-00-00 00:00:00') AND e.status = 'Upcoming')
    )";
    $orderBy = "ORDER BY
        CASE $computedStatus WHEN 'Live' THEN 0 WHEN 'Upcoming' THEN 1 ELSE 2 END,
        (e.start_date IS NULL OR e.start_date = '0000-00-00 00:00:00') ASC,
        e.start_date ASC";
} elseif ($scope === 'archive') {
    $where = "(
        (e.start_date IS NOT NULL AND e.start_date <> '0000-00-00 00:00:00' AND e.start_date < NOW() AND e.status <> 'Live')
        OR e.status IN ('Ended','Completed')
    )";
    $orderBy = "ORDER BY
        (e.start_date IS NULL OR e.start_date = '0000-00-00 00:00:00') ASC,
        e.start_date DESC,
        e.created_at DESC";
} elseif ($scope === 'all') {
    $orderBy = "ORDER BY
        CASE $computedStatus WHEN 'Live' THEN 0 WHEN 'Upcoming' THEN 1 WHEN 'Ended' THEN 2 ELSE 3 END,
        (e.start_date IS NULL OR e.start_date = '0000-00-00 00:00:00') ASC,
        e.start_date DESC,
        e.created_at DESC";
}

$sql = "SELECT e.id, e.title, e.description, e.category, e.mode, ($computedStatus) AS status,
               e.date_display as date, e.start_date, e.venue, e.max_participants, 
               e.participants_count, e.image, e.prizes, e.tags, e.registration_type, e.max_teams,
               e.registration_fee,
               e.contact_email, e.contact_phone,
               u.name as organizer, u.email as user_email
        FROM events e
        LEFT JOIN users u ON e.organizer_id = u.id
        WHERE $where
        $orderBy";

$result = $conn->query($sql);

$events = [];

if ($result) {
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            // Decode JSON fields back to arrays
            $row['prizes'] = json_decode($row['prizes']);
            $row['tags'] = json_decode($row['tags']);

            // Map keys to match frontend 'Event' type if necessary
            // The frontend expects: 
            // id, title, description, category, mode, status, date, startDate, venue, maxParticipants, participantsCount, image, prizes, tags, organizer

            // Adjust specific fields
            $row['startDate'] = $row['start_date'];
            $row['maxParticipants'] = (int) $row['max_participants']; // Ensure integer
            $row['participantsCount'] = (int) $row['participants_count']; // Ensure integer
            $row['registrationType'] = $row['registration_type'];
            $row['maxTeams'] = (int) $row['max_teams'];
            $row['registrationFee'] = isset($row['registration_fee']) ? (float) $row['registration_fee'] : 0.0;
            $row['organizerEmail'] = $row['contact_email'] ? $row['contact_email'] : $row['user_email'];
            $row['organizerPhone'] = $row['contact_phone'];

            // Remove snake_case keys that we re-mapped to camelCase to keep payload clean
            unset($row['start_date']);
            unset($row['max_participants']);
            unset($row['participants_count']);
            unset($row['date_display']); // mapped to 'date' in SQL alias
            unset($row['registration_type']);
            unset($row['max_teams']);
            unset($row['registration_fee']);
            unset($row['contact_email']);
            unset($row['contact_phone']);
            unset($row['user_email']); // derived from alias

            $events[] = $row;
        }
    }

    // Return the events array as JSON
    echo json_encode($events);
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $conn->error]);
}

$conn->close();
?>
