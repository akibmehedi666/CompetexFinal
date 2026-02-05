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

// Fetch upcoming events (date-aware, DB-driven)
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
            e.start_date,
            e.date_display,
            e.venue,
            e.participants_count,
            ($computedStatus) AS status,
            u.name as organizer_name,
            e.organizer_id
        FROM events e
        LEFT JOIN users u ON e.organizer_id = u.id
        WHERE (
            e.status = 'Live'
            OR (e.start_date IS NOT NULL AND e.start_date <> '0000-00-00 00:00:00' AND e.start_date >= NOW())
            OR ((e.start_date IS NULL OR e.start_date = '0000-00-00 00:00:00') AND e.status = 'Upcoming')
        )
        ORDER BY
            CASE ($computedStatus) WHEN 'Live' THEN 0 WHEN 'Upcoming' THEN 1 ELSE 2 END,
            (e.start_date IS NULL OR e.start_date = '0000-00-00 00:00:00') ASC,
            e.start_date ASC
        LIMIT 10";

$result = $conn->query($sql);

$events = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $events[] = $row;
    }
}

echo json_encode(["status" => "success", "data" => $events]);
$conn->close();
?>
