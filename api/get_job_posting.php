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

$job_id = isset($_GET['job_id']) ? trim((string)$_GET['job_id']) : '';
$viewer_id = isset($_GET['viewer_id']) ? trim((string)$_GET['viewer_id']) : '';
if ($job_id === '') {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing job_id"]);
    $conn->close();
    exit();
}
// Expects schema to be provisioned from `competex_db.sql` (no table creation at runtime).

$hasViewer = $viewer_id !== '';
$viewerAppliedSelect = $hasViewer ? "EXISTS(SELECT 1 FROM job_applications ja WHERE ja.job_id = jp.id AND ja.applicant_id = ?) AS viewer_applied" : "0 AS viewer_applied";
$viewerEligibleSelect = $hasViewer ? "EXISTS(SELECT 1 FROM leaderboards l WHERE l.user_id = ? AND l.position <= 5) AS viewer_eligible" : "0 AS viewer_eligible";

$sql = "
    SELECT
        jp.id,
        jp.title,
        jp.company_name,
        jp.location,
        jp.salary_range,
        jp.employment_type,
        jp.description,
        jp.deadline,
        jp.tags,
        jp.created_at,
        u.id AS recruiter_id,
        u.name AS recruiter_name,
        $viewerAppliedSelect,
        $viewerEligibleSelect
    FROM job_postings jp
    LEFT JOIN users u ON jp.recruiter_id = u.id
    WHERE jp.id = ?
    LIMIT 1
";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $conn->error]);
    $conn->close();
    exit();
}

if ($hasViewer) {
    $stmt->bind_param("sss", $viewer_id, $viewer_id, $job_id);
} else {
    $stmt->bind_param("s", $job_id);
}
$stmt->execute();
$res = $stmt->get_result();
$row = $res ? $res->fetch_assoc() : null;
$stmt->close();

if (!$row) {
    http_response_code(404);
    echo json_encode(["status" => "error", "message" => "Job not found"]);
    $conn->close();
    exit();
}

$tags = [];
if (!empty($row["tags"])) {
    $decoded = json_decode($row["tags"], true);
    if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
        $tags = $decoded;
    }
}
$row["tags"] = $tags;

if ($hasViewer) {
    $row["viewer_applied"] = (int)($row["viewer_applied"] ?? 0) === 1;
    $row["viewer_eligible"] = (int)($row["viewer_eligible"] ?? 0) === 1;
    $row["viewer_can_apply"] = ($row["viewer_eligible"] && !$row["viewer_applied"]);
} else {
    $row["viewer_applied"] = false;
    $row["viewer_eligible"] = false;
    $row["viewer_can_apply"] = false;
}

echo json_encode(["status" => "success", "data" => $row]);
$conn->close();
?>
