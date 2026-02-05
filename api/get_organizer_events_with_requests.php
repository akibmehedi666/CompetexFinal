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

$organizer_id = isset($_GET['organizer_id']) ? $_GET['organizer_id'] : null;

if (!$organizer_id) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing organizer_id"]);
    exit();
}

// Expects schema to be provisioned from competex_db.sql (no table creation at runtime).

// Fetch events created by organizer and count pending requests
$computedStatus = "CASE
    WHEN e.status = 'Live' THEN 'Live'
    WHEN e.start_date IS NOT NULL AND e.start_date <> '0000-00-00 00:00:00' THEN
        CASE WHEN e.start_date < NOW() THEN 'Ended' ELSE 'Upcoming' END
    WHEN e.status IN ('Ended','Completed') THEN 'Ended'
    ELSE e.status
END";

$sql = "SELECT
            e.id,
            e.title,
            e.category,
            e.mode,
            ($computedStatus) AS status,
            e.date_display AS date,
            e.start_date,
            e.venue,
            e.participants_count,
            e.image,
            e.registration_type,
            e.created_at,
            COUNT(er.id) as pending_requests,
            COALESCE(rv.avg_rating, 0) AS avg_rating,
            COALESCE(rv.rating_count, 0) AS rating_count
        FROM events e
        LEFT JOIN event_requests er ON e.id = er.event_id AND er.status = 'pending'
        LEFT JOIN (
            SELECT event_id, AVG(rating) AS avg_rating, COUNT(*) AS rating_count
            FROM event_reviews
            GROUP BY event_id
        ) rv ON rv.event_id = e.id
        WHERE e.organizer_id = ?
        GROUP BY e.id
        ORDER BY e.created_at DESC";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $conn->error]);
    $conn->close();
    exit();
}

$stmt->bind_param("s", $organizer_id);
$stmt->execute();
$result = $stmt->get_result();

$events = [];
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $events[] = $row;
    }
}

echo json_encode(["status" => "success", "data" => $events]);
$stmt->close();
$conn->close();
?>
