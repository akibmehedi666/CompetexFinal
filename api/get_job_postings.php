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
// Expects schema to be provisioned from `competex_db.sql` (no table creation at runtime).

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
        u.name AS recruiter_name
    FROM job_postings jp
    LEFT JOIN users u ON jp.recruiter_id = u.id
    ORDER BY jp.created_at DESC
";

$result = $conn->query($sql);
if (!$result) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $conn->error]);
    $conn->close();
    exit();
}

$rows = [];
while ($row = $result->fetch_assoc()) {
    $tags = [];
    if (!empty($row["tags"])) {
        $decoded = json_decode($row["tags"], true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            $tags = $decoded;
        }
    }
    $row["tags"] = $tags;
    $rows[] = $row;
}

echo json_encode(["status" => "success", "data" => $rows]);
$conn->close();
?>
