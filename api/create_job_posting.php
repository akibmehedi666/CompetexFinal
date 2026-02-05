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

$payload = json_decode(file_get_contents("php://input"), true);
if (!is_array($payload)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid JSON body"]);
    $conn->close();
    exit();
}

$recruiter_id = isset($payload["recruiter_id"]) ? trim((string)$payload["recruiter_id"]) : '';
$title = isset($payload["title"]) ? trim((string)$payload["title"]) : '';
$company_name = isset($payload["company_name"]) ? trim((string)$payload["company_name"]) : '';
$location = isset($payload["location"]) ? trim((string)$payload["location"]) : '';
$salary_range = isset($payload["salary_range"]) ? trim((string)$payload["salary_range"]) : '';
$employment_type = isset($payload["employment_type"]) ? trim((string)$payload["employment_type"]) : 'Full-time';
$description = isset($payload["description"]) ? trim((string)$payload["description"]) : '';
$deadline = isset($payload["deadline"]) ? trim((string)$payload["deadline"]) : null;
$tags = isset($payload["tags"]) && is_array($payload["tags"]) ? $payload["tags"] : [];

if ($recruiter_id === '' || $title === '' || $location === '' || $description === '') {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing recruiter_id, title, location, or description"]);
    $conn->close();
    exit();
}

$allowedTypes = ["Full-time", "Internship", "Part-time", "Contract"];
if (!in_array($employment_type, $allowedTypes, true)) {
    $employment_type = "Full-time";
}
// Expects schema to be provisioned from `competex_db.sql` (no table creation at runtime).

$tagsJson = json_encode(array_values(array_filter(array_map(function($t) { return trim((string)$t); }, $tags), function($t) { return $t !== ''; })));
if ($tagsJson === false) $tagsJson = "[]";

// SQL-enforced authorization: only Recruiter can create, and recruiter_id must exist
$sql = "
    INSERT INTO job_postings
        (id, recruiter_id, title, company_name, location, salary_range, employment_type, description, deadline, tags)
    SELECT
        UUID(),
        u.id,
        ?,
        COALESCE(NULLIF(?, ''), rp.company_name, u.name),
        ?,
        NULLIF(?, ''),
        ?,
        ?,
        ?,
        ?
    FROM users u
    LEFT JOIN recruiter_profiles rp ON rp.user_id = u.id
    WHERE u.id = ?
      AND u.role IN ('Recruiter','recruiter')
";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $conn->error]);
    $conn->close();
    exit();
}

$stmt->bind_param(
    "sssssssss",
    $title,
    $company_name,
    $location,
    $salary_range,
    $employment_type,
    $description,
    $deadline,
    $tagsJson,
    $recruiter_id
);

$stmt->execute();
$affected = $stmt->affected_rows;
$stmt->close();

if ($affected === 0) {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Access denied or recruiter not found"]);
    $conn->close();
    exit();
}

echo json_encode(["status" => "success", "message" => "Job posted successfully"]);
$conn->close();
?>
