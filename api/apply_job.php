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
require_once __DIR__ . '/lib/notifications.php';
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$job_id = isset($_POST["job_id"]) ? trim((string)$_POST["job_id"]) : '';
$applicant_id = isset($_POST["applicant_id"]) ? trim((string)$_POST["applicant_id"]) : '';
$message = isset($_POST["message"]) ? trim((string)$_POST["message"]) : '';

if ($job_id === '' || $applicant_id === '') {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing job_id or applicant_id"]);
    $conn->close();
    exit();
}

// Expects schema to be provisioned from `competex_db.sql` (no table creation at runtime).

// Upload handling
$allowedExt = [
    "pdf" => "application/pdf",
    "doc" => "application/msword",
    "docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "png" => "image/png",
    "jpg" => "image/jpeg",
    "jpeg" => "image/jpeg"
];

$baseDir = dirname(__DIR__) . DIRECTORY_SEPARATOR . "uploads" . DIRECTORY_SEPARATOR . "job_applications";
$targetDir = $baseDir . DIRECTORY_SEPARATOR . preg_replace("/[^a-zA-Z0-9\\-]/", "_", $job_id) . DIRECTORY_SEPARATOR . preg_replace("/[^a-zA-Z0-9\\-]/", "_", $applicant_id);
if (!is_dir($targetDir)) {
    @mkdir($targetDir, 0775, true);
}

$storeFile = function(array $file) use ($targetDir, $allowedExt) {
    if (!isset($file["tmp_name"]) || $file["tmp_name"] === '' || !is_uploaded_file($file["tmp_name"])) return null;
    if (!isset($file["name"])) return null;

    $name = (string)$file["name"];
    $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
    if ($ext === '' || !array_key_exists($ext, $allowedExt)) return null;

    $safeBase = preg_replace("/[^a-zA-Z0-9\\-_\\.]/", "_", pathinfo($name, PATHINFO_FILENAME));
    $finalName = $safeBase . "_" . bin2hex(random_bytes(6)) . "." . $ext;
    $dest = $targetDir . DIRECTORY_SEPARATOR . $finalName;

    if (!@move_uploaded_file($file["tmp_name"], $dest)) return null;

    // Return web path relative to project root
    $jobFolder = basename(dirname($targetDir));
    $appFolder = basename($targetDir);
    return "uploads/job_applications/" . $jobFolder . "/" . $appFolder . "/" . $finalName;
};

$cvPath = null;
if (isset($_FILES["cv"])) {
    $cvPath = $storeFile($_FILES["cv"]);
}

$hasCv = $cvPath !== null && $cvPath !== '';
if (!$hasCv) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "CV upload is required"]);
    $conn->close();
    exit();
}

$docs = [];
if (isset($_FILES["documents"])) {
    $f = $_FILES["documents"];
    if (is_array($f["name"])) {
        $count = count($f["name"]);
        for ($i = 0; $i < $count; $i++) {
            $file = [
                "name" => $f["name"][$i],
                "type" => $f["type"][$i] ?? null,
                "tmp_name" => $f["tmp_name"][$i],
                "error" => $f["error"][$i] ?? null,
                "size" => $f["size"][$i] ?? null
            ];
            $p = $storeFile($file);
            if ($p) $docs[] = ["name" => (string)$file["name"], "path" => $p];
        }
    }
}

$docsJson = json_encode($docs);
if ($docsJson === false) $docsJson = "[]";

$conn->begin_transaction();
try {
    // SQL-enforced: only Participant can apply, and job must exist
    $insertSql = "
        INSERT INTO job_applications (id, job_id, applicant_id, status, message, cv_path, documents, created_at)
        SELECT
            UUID(),
            jp.id,
            u.id,
            'pending',
            NULLIF(?, ''),
            ?,
            ?,
            CURRENT_TIMESTAMP
        FROM job_postings jp
        JOIN users u ON u.id = ?
        WHERE jp.id = ?
          AND EXISTS (
              SELECT 1
              FROM leaderboards l
              WHERE l.user_id = u.id
                AND l.position <= 5
          )
    ";
    $stmt = $conn->prepare($insertSql);
    $stmt->bind_param("sssss", $message, $cvPath, $docsJson, $applicant_id, $job_id);
    $stmt->execute();
    $affected = $stmt->affected_rows;
    $stmt->close();

    if ($affected === 0) {
        $conn->rollback();
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Not eligible to apply, or job not found"]);
        $conn->close();
        exit();
    }

    // Notify recruiter (best-effort)
    $selectNotif = "
        SELECT
            jp.recruiter_id AS user_id,
            jp.id AS reference_id,
            CONCAT('New job application for \"', jp.title, '\" from ', u.name, '.') AS message
        FROM job_postings jp
        JOIN users u ON u.id = ?
        WHERE jp.id = ?
        LIMIT 1
    ";
    competex_notify_from_select_mysqli($conn, $selectNotif, "ss", [$applicant_id, $job_id], "job_application");

    $conn->commit();
    echo json_encode(["status" => "success", "message" => "Application submitted", "cv_path" => $cvPath, "documents" => $docs]);
} catch (mysqli_sql_exception $e) {
    $conn->rollback();
    if ((int)$e->getCode() === 1062) {
        http_response_code(409);
        echo json_encode(["status" => "error", "message" => "You already applied to this job"]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
    }
} finally {
    $conn->close();
}
?>
