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

// Query params
$scope = isset($_GET['scope']) ? strtolower(trim((string)$_GET['scope'])) : 'free'; // free|premium|all
$domain = isset($_GET['domain']) ? trim((string)$_GET['domain']) : '';
$subject = isset($_GET['subject']) ? trim((string)$_GET['subject']) : '';
$q = isset($_GET['q']) ? trim((string)$_GET['q']) : '';
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 200;
$offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

if ($limit <= 0 || $limit > 500) $limit = 200;
if ($offset < 0) $offset = 0;

// Expects schema to be provisioned from `competex_db.sql` (no table creation at runtime).

try {
    $where = [];
    $types = "";
    $params = [];

    if ($scope === 'free') {
        $where[] = "r.is_premium = 0";
    } elseif ($scope === 'premium') {
        $where[] = "r.is_premium = 1";
    }

    if ($domain !== '' && strtolower($domain) !== 'all') {
        $where[] = "r.domain = ?";
        $types .= "s";
        $params[] = $domain;
    }

    if ($subject !== '' && strtolower($subject) !== 'all') {
        $where[] = "r.subject = ?";
        $types .= "s";
        $params[] = $subject;
    }

    if ($q !== '') {
        $where[] = "(r.name LIKE CONCAT('%', ?, '%')
            OR r.domain LIKE CONCAT('%', ?, '%')
            OR r.subject LIKE CONCAT('%', ?, '%')
            OR r.category LIKE CONCAT('%', ?, '%')
            OR r.description LIKE CONCAT('%', ?, '%'))";
        $types .= "sssss";
        $params[] = $q;
        $params[] = $q;
        $params[] = $q;
        $params[] = $q;
        $params[] = $q;
    }

    $whereSql = count($where) ? ("WHERE " . implode(" AND ", $where)) : "";

    $sql = "
        SELECT
            r.id,
            r.name,
            r.domain,
            r.subject,
            r.category,
            r.description,
            r.file_type AS fileType,
            r.file_name AS fileName,
            r.file_size_bytes AS fileSizeBytes,
            r.downloads,
            DATE_FORMAT(r.created_at, '%b %e, %Y') AS date,
            u.name AS uploaderName
        FROM community_resources r
        JOIN users u ON u.id = r.uploader_id
        $whereSql
        ORDER BY r.created_at DESC
        LIMIT ?
        OFFSET ?
    ";

    $types .= "ii";
    $params[] = $limit;
    $params[] = $offset;

    $stmt = $conn->prepare($sql);
    if (!$stmt) throw new Exception("Database error: " . $conn->error);

    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $res = $stmt->get_result();

    $rows = [];
    while ($res && ($row = $res->fetch_assoc())) {
        $row["downloads"] = (int)($row["downloads"] ?? 0);
        $row["fileSizeBytes"] = (int)($row["fileSizeBytes"] ?? 0);
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
