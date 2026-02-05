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

$event_id = isset($_GET['event_id']) ? trim((string)$_GET['event_id']) : '';
$viewer_id = isset($_GET['viewer_id']) ? trim((string)$_GET['viewer_id']) : '';
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
if ($limit <= 0 || $limit > 100) $limit = 20;

if ($event_id === '') {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing event_id"]);
    $conn->close();
    exit();
}

// Expects schema to be provisioned from `competex_db.sql` (no table creation at runtime).

try {
    $hasViewer = $viewer_id !== '';

    // "Completed" is defined as:
    // - explicit status (Ended/Completed), OR
    // - start_date in the past AND not Upcoming/Live (fallback for legacy data)
    $completedExpr = "(
        e.status IN ('Ended','Completed')
        OR (
            e.start_date IS NOT NULL
            AND e.start_date <> '0000-00-00 00:00:00'
            AND e.start_date < NOW()
            AND e.status <> 'Live'
        )
    )";

    $viewerHasReviewExpr = $hasViewer
        ? "EXISTS(SELECT 1 FROM event_reviews r2 WHERE r2.event_id = e.id AND r2.user_id = ?) AS viewer_has_review"
        : "0 AS viewer_has_review";

    $viewerRegisteredExpr = $hasViewer
        ? "(
            EXISTS(SELECT 1 FROM users v WHERE v.id = ? AND v.role IN ('Participant','participant'))
            AND (
                EXISTS(
                    SELECT 1
                    FROM event_registrations er
                    WHERE er.event_id = e.id
                      AND er.status = 'approved'
                      AND (
                          er.user_id = ?
                          OR (
                              er.team_id IS NOT NULL
                              AND EXISTS (
                                  SELECT 1
                                  FROM team_members tm
                                  WHERE tm.team_id = er.team_id
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
        ) AS viewer_registered"
        : "0 AS viewer_registered";

    $metaSql = "
        SELECT
            e.id AS event_id,
            COALESCE(AVG(r.rating), 0) AS avg_rating,
            COUNT(r.id) AS rating_count,
            $completedExpr AS event_completed,
            $viewerHasReviewExpr,
            $viewerRegisteredExpr
        FROM events e
        LEFT JOIN event_reviews r ON r.event_id = e.id
        WHERE e.id = ?
        GROUP BY e.id
        LIMIT 1
    ";

    $stmtM = $conn->prepare($metaSql);
    if (!$stmtM) {
        throw new Exception("Database error: " . $conn->error);
    }

    if ($hasViewer) {
        // viewer_has_review (1) + viewer_registered (5, incl role check) + event_id
        $stmtM->bind_param("sssssss", $viewer_id, $viewer_id, $viewer_id, $viewer_id, $viewer_id, $viewer_id, $event_id);
    } else {
        $stmtM->bind_param("s", $event_id);
    }

    $stmtM->execute();
    $metaRes = $stmtM->get_result();
    $meta = $metaRes ? $metaRes->fetch_assoc() : null;
    $stmtM->close();

    if (!$meta) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Event not found"]);
        $conn->close();
        exit();
    }

    $avg = (float)($meta["avg_rating"] ?? 0);
    $count = (int)($meta["rating_count"] ?? 0);
    $eventCompleted = (int)($meta["event_completed"] ?? 0) === 1;
    $viewerHasReview = (int)($meta["viewer_has_review"] ?? 0) === 1;
    $viewerRegistered = (int)($meta["viewer_registered"] ?? 0) === 1;

    $reviewsSql = "
        SELECT
            r.id,
            r.user_id,
            u.name,
            u.avatar,
            r.rating,
            r.review,
            r.created_at
        FROM event_reviews r
        JOIN users u ON u.id = r.user_id
        WHERE r.event_id = ?
        ORDER BY r.created_at DESC
        LIMIT ?
    ";
    $stmtR = $conn->prepare($reviewsSql);
    $stmtR->bind_param("si", $event_id, $limit);
    $stmtR->execute();
    $revRes = $stmtR->get_result();
    $reviews = [];
    while ($revRes && ($row = $revRes->fetch_assoc())) {
        $row["rating"] = (int)($row["rating"] ?? 0);
        $reviews[] = $row;
    }
    $stmtR->close();

    echo json_encode([
        "status" => "success",
        "data" => [
            "event_id" => $event_id,
            "avg_rating" => $avg,
            "rating_count" => $count,
            "event_completed" => $eventCompleted,
            "viewer_registered" => $hasViewer ? $viewerRegistered : null,
            "viewer_has_review" => $hasViewer ? $viewerHasReview : null,
            "viewer_can_review" => $hasViewer ? ($eventCompleted && $viewerRegistered && !$viewerHasReview) : null,
            "reviews" => $reviews
        ]
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
} finally {
    $conn->close();
}
?>
