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

$user_id = isset($_GET['user_id']) ? trim((string)$_GET['user_id']) : '';
if ($user_id === '') {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing user_id"]);
    $conn->close();
    exit();
}

// Expects schema to be provisioned from `competex_db.sql` (no table creation at runtime).

try {
    $completedExpr = "(
        e.status IN ('Ended','Completed')
        OR (
            e.start_date IS NOT NULL
            AND e.start_date <> '0000-00-00 00:00:00'
            AND e.start_date < NOW()
            AND e.status <> 'Live'
        )
    )";

    $sql = "
        SELECT
            e.id,
            e.title,
            e.description,
            e.category,
            e.mode,
            CASE
                WHEN e.status = 'Live' THEN 'Live'
                WHEN e.start_date IS NOT NULL AND e.start_date <> '0000-00-00 00:00:00' THEN
                    CASE WHEN e.start_date < NOW() THEN 'Ended' ELSE 'Upcoming' END
                WHEN e.status IN ('Ended','Completed') THEN 'Ended'
                ELSE e.status
            END AS status,
            e.date_display AS date,
            e.start_date,
            e.venue,
            e.image,
            COALESCE(er.avg_rating, 0) AS avg_rating,
            COALESCE(er.rating_count, 0) AS rating_count,
            EXISTS(SELECT 1 FROM event_reviews r0 WHERE r0.event_id = e.id AND r0.user_id = ?) AS has_review
        FROM events e
        JOIN users viewer ON viewer.id = ? AND viewer.role IN ('Participant','participant')
        LEFT JOIN (
            SELECT event_id, AVG(rating) AS avg_rating, COUNT(*) AS rating_count
            FROM event_reviews
            GROUP BY event_id
        ) er ON er.event_id = e.id
        WHERE $completedExpr
          AND (
              EXISTS(
                  SELECT 1
                  FROM event_registrations reg
                  WHERE reg.event_id = e.id
                    AND reg.status = 'approved'
                    AND (
                        reg.user_id = ?
                        OR (
                            reg.team_id IS NOT NULL
                            AND EXISTS (
                                SELECT 1
                                FROM team_members tm
                                WHERE tm.team_id = reg.team_id
                                  AND tm.user_id = ?
                            )
                        )
                    )
              )
              OR EXISTS(SELECT 1 FROM event_participants ep WHERE ep.event_id = e.id AND ep.user_id = ?)
              OR EXISTS(
                  SELECT 1
                  FROM event_teams et
                  JOIN team_members tm2 ON tm2.team_id = et.team_id
                  WHERE et.event_id = e.id
                    AND tm2.user_id = ?
              )
          )
        ORDER BY
            (e.start_date IS NULL OR e.start_date = '0000-00-00 00:00:00') ASC,
            e.start_date DESC,
            e.created_at DESC
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssssss", $user_id, $user_id, $user_id, $user_id, $user_id, $user_id);
    $stmt->execute();
    $res = $stmt->get_result();

    $rows = [];
    while ($res && ($row = $res->fetch_assoc())) {
        $row["avg_rating"] = (float)($row["avg_rating"] ?? 0);
        $row["rating_count"] = (int)($row["rating_count"] ?? 0);
        $row["has_review"] = (int)($row["has_review"] ?? 0) === 1;

        $row["startDate"] = $row["start_date"] ?? null;
        unset($row["start_date"]);

        $rows[] = $row;
    }
    $stmt->close();

    echo json_encode(["status" => "success", "data" => $rows]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
} finally {
    $conn->close();
}
?>
