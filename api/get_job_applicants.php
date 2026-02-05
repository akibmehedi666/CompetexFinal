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

$job_id = isset($_GET['job_id']) ? trim((string)$_GET['job_id']) : '';
$recruiter_id = isset($_GET['recruiter_id']) ? trim((string)$_GET['recruiter_id']) : '';

if ($job_id === '' || $recruiter_id === '') {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing job_id or recruiter_id"]);
    $conn->close();
    exit();
}
// Expects schema to be provisioned from `competex_db.sql` (no table creation at runtime).

try {
    // SQL-enforced access: only owner recruiter can view applicants for this job
    $sql = "
        SELECT
            ja.id AS application_id,
            ja.status AS application_status,
            ja.message AS application_message,
            ja.cv_path,
            ja.documents,
            ja.created_at AS applied_at,
            u.id AS user_id,
            u.name,
            u.email,
            u.avatar,
            u.university,
            u.skills,
            u.department,
            u.location,
            pp.bio,
            pp.github,
            pp.linkedin,
            pp.portfolio
        FROM job_applications ja
        JOIN job_postings jp ON ja.job_id = jp.id
        JOIN users r ON jp.recruiter_id = r.id AND r.role IN ('Recruiter','recruiter')
        JOIN users u ON ja.applicant_id = u.id
        LEFT JOIN participant_profiles pp ON pp.user_id = u.id
        WHERE ja.job_id = ?
          AND jp.recruiter_id = ?
        ORDER BY ja.created_at DESC
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $job_id, $recruiter_id);
    $stmt->execute();
    $res = $stmt->get_result();

    $rows = [];
    while ($res && ($row = $res->fetch_assoc())) {
        if (isset($row["skills"]) && is_string($row["skills"])) {
            $decoded = json_decode($row["skills"], true);
            $row["skills"] = (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) ? $decoded : [];
        }
        if (!isset($row["skills"]) || !is_array($row["skills"])) {
            $row["skills"] = [];
        }

        $docs = [];
        if (!empty($row["documents"])) {
            $decodedDocs = json_decode($row["documents"], true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decodedDocs)) {
                $docs = $decodedDocs;
            }
        }
        $row["documents"] = $docs;
        $rows[] = $row;
    }

    $stmt->close();
    echo json_encode(["status" => "success", "data" => $rows]);
} catch (mysqli_sql_exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
} finally {
    $conn->close();
}
?>
