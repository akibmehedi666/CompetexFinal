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

function safe_trim($v): string {
    return trim((string)$v);
}

function slug_filename(string $name): string {
    $name = preg_replace('/[^A-Za-z0-9._-]+/', '_', $name);
    $name = preg_replace('/_+/', '_', $name);
    $name = trim($name, '_');
    return $name !== '' ? $name : 'file';
}

function uuid_v4(): string {
    $data = random_bytes(16);
    $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
    $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

// Expects schema to be provisioned from `competex_db.sql` (no table creation at runtime).

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(["status" => "error", "message" => "Method not allowed"]);
        $conn->close();
        exit();
    }

    $uploader_id = isset($_POST['uploader_id']) ? safe_trim($_POST['uploader_id']) : '';
    $name = isset($_POST['name']) ? safe_trim($_POST['name']) : '';
    $domain = isset($_POST['domain']) ? safe_trim($_POST['domain']) : '';
    $subject = isset($_POST['subject']) ? safe_trim($_POST['subject']) : '';
    $category = isset($_POST['category']) ? safe_trim($_POST['category']) : 'Other';
    $description = isset($_POST['description']) ? safe_trim($_POST['description']) : '';

    if ($uploader_id === '' || $name === '' || $domain === '' || $subject === '') {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Missing uploader_id, name, domain, or subject"]);
        $conn->close();
        exit();
    }

    if (!isset($_FILES['file']) || !is_array($_FILES['file'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Missing file upload"]);
        $conn->close();
        exit();
    }

    $file = $_FILES['file'];
    if (($file['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "File upload error"]);
        $conn->close();
        exit();
    }

    $size = (int)($file['size'] ?? 0);
    if ($size <= 0 || $size > 5 * 1024 * 1024) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "File size must be <= 5MB"]);
        $conn->close();
        exit();
    }

    // Verify uploader exists
    $stmtU = $conn->prepare("SELECT id FROM users WHERE id = ? LIMIT 1");
    $stmtU->bind_param("s", $uploader_id);
    $stmtU->execute();
    $uRes = $stmtU->get_result();
    $exists = $uRes && $uRes->num_rows > 0;
    $stmtU->close();
    if (!$exists) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Uploader not found"]);
        $conn->close();
        exit();
    }

    $originalName = (string)($file['name'] ?? 'file');
    $safeName = slug_filename($originalName);

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = $finfo ? finfo_file($finfo, $file['tmp_name']) : null;
    if ($finfo) finfo_close($finfo);
    $mime = $mime ? (string)$mime : (string)($file['type'] ?? 'application/octet-stream');

    $allowedExt = ['pdf', 'zip', 'png', 'jpg', 'jpeg', 'doc', 'docx'];
    $ext = strtolower(pathinfo($safeName, PATHINFO_EXTENSION));
    if ($ext === '' || !in_array($ext, $allowedExt, true)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Unsupported file type"]);
        $conn->close();
        exit();
    }

    $resourceId = uuid_v4();

    $uploadDir = realpath(__DIR__ . '/../uploads');
    if ($uploadDir === false) {
        $uploadDir = __DIR__ . '/../uploads';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0775, true);
        }
        $uploadDir = realpath($uploadDir);
    }

    $resourcesDir = $uploadDir . DIRECTORY_SEPARATOR . 'resources';
    if (!is_dir($resourcesDir)) {
        mkdir($resourcesDir, 0775, true);
    }

    $storedFileName = $resourceId . "_" . $safeName;
    $destPath = $resourcesDir . DIRECTORY_SEPARATOR . $storedFileName;

    if (!move_uploaded_file($file['tmp_name'], $destPath)) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to store uploaded file"]);
        $conn->close();
        exit();
    }

    $relativePath = "uploads/resources/" . $storedFileName;

    $sql = "INSERT INTO community_resources
            (id, uploader_id, name, domain, subject, category, description, file_path, file_type, file_name, file_size_bytes, downloads, is_premium, created_at)
            VALUES (?, ?, ?, ?, ?, ?, NULLIF(?, ''), ?, ?, ?, ?, 0, 0, CURRENT_TIMESTAMP)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param(
        "ssssssssssi",
        $resourceId,
        $uploader_id,
        $name,
        $domain,
        $subject,
        $category,
        $description,
        $relativePath,
        $mime,
        $originalName,
        $size
    );
    $stmt->execute();
    $stmt->close();

    // Return the inserted row for immediate UI sync
    $outSql = "
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
        WHERE r.id = ?
        LIMIT 1
    ";
    $stmtO = $conn->prepare($outSql);
    $stmtO->bind_param("s", $resourceId);
    $stmtO->execute();
    $oRes = $stmtO->get_result();
    $row = $oRes ? $oRes->fetch_assoc() : null;
    $stmtO->close();

    echo json_encode(["status" => "success", "data" => $row]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
} finally {
    $conn->close();
}
?>
