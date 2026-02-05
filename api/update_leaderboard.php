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

// Throw mysqli_sql_exception for reliable transaction error handling in this endpoint
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$data = json_decode(file_get_contents("php://input"), true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid JSON body"]);
    $conn->close();
    exit();
}

$event_id = isset($data["event_id"]) ? trim((string)$data["event_id"]) : '';
$organizer_id = isset($data["organizer_id"]) ? trim((string)$data["organizer_id"]) : '';
$entries = isset($data["entries"]) && is_array($data["entries"]) ? $data["entries"] : null;

if ($event_id === '' || $organizer_id === '' || !$entries) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing event_id, organizer_id, or entries"]);
    $conn->close();
    exit();
}

// Expects schema to be provisioned from `competex_db.sql` (no table creation at runtime).

// SQL-level ownership check (and ensure organizer role)
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

$rows = [];
foreach ($entries as $row) {
    if (!is_array($row)) continue;
    $id = isset($row["id"]) ? trim((string)$row["id"]) : '';
    $position = isset($row["position"]) ? (int)$row["position"] : null;
    $points = isset($row["points"]) ? (int)$row["points"] : null;
    if ($id === '' || $position === null || $points === null) continue;
    $rows[] = ["id" => $id, "position" => $position, "points" => $points];
}

if (count($rows) === 0) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "No valid entries to update"]);
    $conn->close();
    exit();
}

$conn->begin_transaction();
try {
    // Step 1: offset positions to avoid unique key collisions while reordering
    $ids = array_map(fn($r) => $r["id"], $rows);
    $placeholders = implode(",", array_fill(0, count($ids), "?"));
    $offsetSql = "
        UPDATE leaderboards l
        JOIN events e ON l.event_id = e.id
        SET l.position = l.position + 1000000
        WHERE l.event_id = ?
          AND e.organizer_id = ?
          AND l.id IN ($placeholders)
    ";
    $stmtOffset = $conn->prepare($offsetSql);
    if (!$stmtOffset) {
        throw new Exception("Database error: " . $conn->error);
    }

    $types = "ss" . str_repeat("s", count($ids));
    $params = array_merge([$event_id, $organizer_id], $ids);
    $stmtOffset->bind_param($types, ...$params);
    $stmtOffset->execute();
    $stmtOffset->close();

    // Step 2: apply new positions/points in one UPDATE via derived table
    $unionParts = [];
    $types2 = "";
    $params2 = [];
    foreach ($rows as $r) {
        $unionParts[] = "SELECT ? AS id, ? AS position, ? AS points";
        $types2 .= "sii";
        $params2[] = $r["id"];
        $params2[] = $r["position"];
        $params2[] = $r["points"];
    }
    $derived = implode(" UNION ALL ", $unionParts);

    $updateSql = "
        UPDATE leaderboards l
        JOIN events e ON l.event_id = e.id
        JOIN (
            $derived
        ) v ON v.id = l.id
        SET l.position = v.position,
            l.points = v.points
        WHERE l.event_id = ?
          AND e.organizer_id = ?
    ";

    $stmtUpdate = $conn->prepare($updateSql);
    if (!$stmtUpdate) {
        throw new Exception("Database error: " . $conn->error);
    }

    $typesFinal = $types2 . "ss";
    $paramsFinal = array_merge($params2, [$event_id, $organizer_id]);
    $stmtUpdate->bind_param($typesFinal, ...$paramsFinal);
    $stmtUpdate->execute();
    $affected = $stmtUpdate->affected_rows;
    $stmtUpdate->close();

    $conn->commit();
    echo json_encode(["status" => "success", "updated_rows" => $affected]);
} catch (mysqli_sql_exception $e) {
    $conn->rollback();
    if ((int)$e->getCode() === 1062) {
        http_response_code(409);
        echo json_encode(["status" => "error", "message" => "Duplicate positions detected. Each position must be unique per event."]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
    }
} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}

$conn->close();
?>
