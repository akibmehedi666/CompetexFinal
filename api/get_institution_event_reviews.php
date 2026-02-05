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

$institution_id = isset($_GET['institution_id']) ? trim((string)$_GET['institution_id']) : '';
if ($institution_id === '') {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing institution_id"]);
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

    // All reviews for archived/completed events hosted by this institution
    $sql = "
        SELECT
            e.id AS event_id,
            e.title AS event_title,
            r.id AS review_id,
            r.rating,
            r.review,
            r.created_at,
            u.id AS user_id,
            u.name AS user_name,
            u.avatar AS user_avatar
        FROM organizer_profiles op
        JOIN users org ON org.id = op.user_id AND org.role IN ('Organizer','organizer')
        JOIN events e ON e.organizer_id = op.user_id
        JOIN event_reviews r ON r.event_id = e.id
        JOIN users u ON u.id = r.user_id
        WHERE op.is_institution = 1
          AND op.user_id = ?
          AND $completedExpr
        ORDER BY e.start_date DESC, r.created_at DESC
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $institution_id);
    $stmt->execute();
    $res = $stmt->get_result();

    $rows = [];
    while ($res && ($row = $res->fetch_assoc())) {
        $row["rating"] = (int)($row["rating"] ?? 0);
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
