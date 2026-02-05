<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db_connect.php';
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$resource_id = isset($_GET['resource_id']) ? trim((string)$_GET['resource_id']) : '';
if ($resource_id === '') {
    http_response_code(400);
    header("Content-Type: application/json; charset=UTF-8");
    echo json_encode(["status" => "error", "message" => "Missing resource_id"]);
    $conn->close();
    exit();
}

// Expects schema to be provisioned from `competex_db.sql` (no table creation at runtime).

try {
    $conn->begin_transaction();

    $stmtS = $conn->prepare("SELECT file_path, file_type, file_name FROM community_resources WHERE id = ? LIMIT 1");
    $stmtS->bind_param("s", $resource_id);
    $stmtS->execute();
    $res = $stmtS->get_result();
    $row = $res ? $res->fetch_assoc() : null;
    $stmtS->close();

    if (!$row) {
        $conn->rollback();
        http_response_code(404);
        header("Content-Type: application/json; charset=UTF-8");
        echo json_encode(["status" => "error", "message" => "Resource not found"]);
        $conn->close();
        exit();
    }

    $stmtU = $conn->prepare("UPDATE community_resources SET downloads = downloads + 1 WHERE id = ?");
    $stmtU->bind_param("s", $resource_id);
    $stmtU->execute();
    $stmtU->close();

    $conn->commit();

    $relativePath = (string)($row["file_path"] ?? "");
    $fileType = (string)($row["file_type"] ?? "application/octet-stream");
    $fileName = (string)($row["file_name"] ?? "resource");

    $base = realpath(__DIR__ . "/..");
    $fullPath = $base ? realpath($base . DIRECTORY_SEPARATOR . $relativePath) : false;
    if ($fullPath === false || !is_file($fullPath)) {
        http_response_code(404);
        header("Content-Type: application/json; charset=UTF-8");
        echo json_encode(["status" => "error", "message" => "File not found on server"]);
        $conn->close();
        exit();
    }

    // Basic path traversal guard: must reside under /uploads/resources
    $uploadsDir = realpath(__DIR__ . "/../uploads/resources");
    if ($uploadsDir && strpos($fullPath, $uploadsDir) !== 0) {
        http_response_code(403);
        header("Content-Type: application/json; charset=UTF-8");
        echo json_encode(["status" => "error", "message" => "Invalid file path"]);
        $conn->close();
        exit();
    }

    // Override JSON content type set by db_connect.php
    header_remove("Content-Type");
    header("Content-Type: " . $fileType);
    header("Content-Disposition: attachment; filename=\"" . addslashes($fileName) . "\"");
    header("Content-Length: " . filesize($fullPath));
    header("X-Content-Type-Options: nosniff");

    readfile($fullPath);
} catch (Throwable $e) {
    if ($conn && $conn->errno === 0) {
        // ignore
    }
    if ($conn) {
        try { $conn->rollback(); } catch (Throwable $t) {}
    }
    http_response_code(500);
    header("Content-Type: application/json; charset=UTF-8");
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
} finally {
    $conn->close();
}
?>
