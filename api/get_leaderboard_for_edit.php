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

$event_id = isset($_GET['event_id']) ? trim((string)$_GET['event_id']) : '';
$organizer_id = isset($_GET['organizer_id']) ? trim((string)$_GET['organizer_id']) : '';

if ($event_id === '' || $organizer_id === '') {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing event_id or organizer_id"]);
    $conn->close();
    exit();
}

// Expects schema to be provisioned from `competex_db.sql` (no table creation at runtime).

// Ownership check (and ensure organizer role)
$stmtOwner = $conn->prepare("
    SELECT 1
    FROM events e
    JOIN users u ON e.organizer_id = u.id
    WHERE e.id = ?
      AND e.organizer_id = ?
      AND u.role IN ('Organizer', 'organizer')
    LIMIT 1
");
if (!$stmtOwner) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $conn->error]);
    $conn->close();
    exit();
}
$stmtOwner->bind_param("ss", $event_id, $organizer_id);
$stmtOwner->execute();
$ownerRes = $stmtOwner->get_result();
$isOwner = $ownerRes && $ownerRes->num_rows > 0;
$stmtOwner->close();

if (!$isOwner) {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Access denied"]);
    $conn->close();
    exit();
}

// Seed baseline entries only if none exist for this event (avoids position collisions)
$hasAnyStmt = $conn->prepare("SELECT 1 FROM leaderboards WHERE event_id = ? LIMIT 1");
$hasAny = false;
if ($hasAnyStmt) {
    $hasAnyStmt->bind_param("s", $event_id);
    $hasAnyStmt->execute();
    $hasAnyRes = $hasAnyStmt->get_result();
    $hasAny = $hasAnyRes && $hasAnyRes->num_rows > 0;
    $hasAnyStmt->close();
}

if (!$hasAny) {
    // Seed entries from event participants (no PHP-side filtering; INSERT IGNORE prevents duplicates)
    // Uses SQL session variables to assign positions.
    $seedSql = "
        INSERT IGNORE INTO leaderboards (id, event_id, user_id, position, points)
        SELECT
            UUID(),
            ? AS event_id,
            t.user_id,
            t.position,
            t.points
        FROM (
            SELECT
                ep.user_id,
                (@pos := @pos + 1) AS position,
                COALESCE(us.points, 0) AS points
            FROM (SELECT @pos := 0) vars
            JOIN event_participants ep ON ep.event_id = ?
            JOIN users u ON u.id = ep.user_id
            LEFT JOIN user_stats us ON us.user_id = ep.user_id
            ORDER BY COALESCE(us.points, 0) DESC, u.name ASC
        ) AS t
    ";

    $stmtSeed = $conn->prepare($seedSql);
    if ($stmtSeed) {
        $stmtSeed->bind_param("ss", $event_id, $event_id);
        $stmtSeed->execute();
        $stmtSeed->close();
    }
}

// Fetch editable leaderboard (organizer-scoped via join on events)
$sql = "
    SELECT
        l.id,
        l.user_id,
        u.name AS participant_name,
        u.avatar,
        u.university AS institution,
        l.position,
        l.points
    FROM leaderboards l
    JOIN users u ON l.user_id = u.id
    JOIN events e ON l.event_id = e.id
    WHERE l.event_id = ?
      AND e.organizer_id = ?
    ORDER BY l.position ASC, u.name ASC
";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $conn->error]);
    $conn->close();
    exit();
}
$stmt->bind_param("ss", $event_id, $organizer_id);
$stmt->execute();
$res = $stmt->get_result();
$rows = [];
while ($res && ($row = $res->fetch_assoc())) {
    $row["position"] = (int)$row["position"];
    $row["points"] = (int)$row["points"];
    $rows[] = $row;
}

echo json_encode(["status" => "success", "data" => $rows]);

$stmt->close();
$conn->close();
?>
