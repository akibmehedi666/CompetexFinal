<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db_connect.php';
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$payload = json_decode(file_get_contents("php://input"), true);
if (!is_array($payload)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid JSON body"]);
    $conn->close();
    exit();
}

$event_id = isset($payload["event_id"]) ? trim((string)$payload["event_id"]) : '';
$user_id = isset($payload["user_id"]) ? trim((string)$payload["user_id"]) : '';
$rating = isset($payload["rating"]) ? (int)$payload["rating"] : 0;
$review = isset($payload["review"]) ? trim((string)$payload["review"]) : '';

if ($event_id === '' || $user_id === '' || $rating < 1 || $rating > 5) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing event_id/user_id or invalid rating"]);
    $conn->close();
    exit();
}

// Expects schema to be provisioned from `competex_db.sql` (no table creation at runtime).

try {
    // Completed condition (same as get_event_reviews.php)
    $completedExpr = "(
        e.status IN ('Ended','Completed')
        OR (
            e.start_date IS NOT NULL
            AND e.start_date <> '0000-00-00 00:00:00'
            AND e.start_date < NOW()
            AND e.status <> 'Live'
        )
    )";

    // SQL-enforced eligibility:
    // - event must be completed
    // - user must be approved/registered for the event (individual or member of enrolled team)
    // - one review per user per event (unique constraint)
    $sql = "
        INSERT INTO event_reviews (id, event_id, user_id, rating, review, created_at)
        SELECT
            UUID(),
            e.id,
            u.id,
            ?,
            NULLIF(?, ''),
            CURRENT_TIMESTAMP
        FROM events e
        JOIN users u ON u.id = ? AND u.role IN ('Participant','participant')
        WHERE e.id = ?
          AND $completedExpr
          AND (
              EXISTS(
                  SELECT 1
                  FROM event_registrations er
                  WHERE er.event_id = e.id
                    AND er.status = 'approved'
                    AND (
                        er.user_id = u.id
                        OR (
                            er.team_id IS NOT NULL
                            AND EXISTS (
                                SELECT 1
                                FROM team_members tm
                                WHERE tm.team_id = er.team_id
                                  AND tm.user_id = u.id
                            )
                        )
                    )
              )
              OR EXISTS(SELECT 1 FROM event_participants ep WHERE ep.event_id = e.id AND ep.user_id = u.id)
              OR EXISTS(
                  SELECT 1
                  FROM event_teams et
                  JOIN team_members tm2 ON tm2.team_id = et.team_id
                  WHERE et.event_id = e.id
                    AND tm2.user_id = u.id
              )
          )
        LIMIT 1
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("isss", $rating, $review, $user_id, $event_id);
    $stmt->execute();
    $affected = $stmt->affected_rows;
    $stmt->close();

    if ($affected === 0) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Not eligible to review this event"]);
        $conn->close();
        exit();
    }

    echo json_encode(["status" => "success", "message" => "Review submitted"]);
} catch (mysqli_sql_exception $e) {
    if ((int)$e->getCode() === 1062) {
        http_response_code(409);
        echo json_encode(["status" => "error", "message" => "You already reviewed this event"]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
    }
} finally {
    $conn->close();
}
?>
