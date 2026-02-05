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
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    // Institutions are derived from organizers who are flagged as institutions and have hosted >= 1 event.
    // All aggregation is done in SQL (DB-driven).
    $sql = "
        SELECT
            op.user_id AS institution_id,
            op.organization_name AS name,
            op.website,
            op.is_institution,
            COUNT(e.id) AS total_events,
            SUM(
                CASE
                    WHEN e.start_date IS NOT NULL
                     AND e.start_date >= NOW()
                     AND e.status IN ('Upcoming','Live')
                    THEN 1 ELSE 0
                END
            ) AS upcoming_events,
            MAX(e.start_date) AS last_event_date,
            (
                SELECT e2.venue
                FROM events e2
                WHERE e2.organizer_id = op.user_id
                  AND e2.venue IS NOT NULL
                  AND e2.venue <> ''
                ORDER BY e2.start_date DESC, e2.created_at DESC
                LIMIT 1
            ) AS location,
            (
                SELECT e3.title
                FROM events e3
                WHERE e3.organizer_id = op.user_id
                ORDER BY e3.start_date DESC, e3.created_at DESC
                LIMIT 1
            ) AS last_event_title
        FROM organizer_profiles op
        JOIN users u ON u.id = op.user_id AND u.role IN ('Organizer','organizer')
        JOIN events e ON e.organizer_id = op.user_id
        WHERE op.is_institution = 1
        GROUP BY op.user_id, op.organization_name, op.website, op.is_institution
        ORDER BY upcoming_events DESC, total_events DESC, name ASC
    ";

    $res = $conn->query($sql);
    $rows = [];
    while ($res && ($row = $res->fetch_assoc())) {
        $row["total_events"] = (int)($row["total_events"] ?? 0);
        $row["upcoming_events"] = (int)($row["upcoming_events"] ?? 0);
        $row["is_institution"] = (int)($row["is_institution"] ?? 0) === 1;
        $rows[] = $row;
    }

    echo json_encode(["status" => "success", "data" => $rows]);
} catch (mysqli_sql_exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
} finally {
    $conn->close();
}
?>

