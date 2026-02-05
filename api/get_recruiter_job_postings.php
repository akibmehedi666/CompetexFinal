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

$recruiter_id = isset($_GET['recruiter_id']) ? trim((string)$_GET['recruiter_id']) : '';
if ($recruiter_id === '') {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing recruiter_id"]);
    $conn->close();
    exit();
}

// Expects schema to be provisioned from competex_db.sql (no table creation at runtime).

try {
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
            jp.updated_at,
            COUNT(ja.id) AS applicant_count,
            SUM(CASE WHEN ja.status = 'pending' THEN 1 ELSE 0 END) AS pending_count
        FROM job_postings jp
        JOIN users u ON jp.recruiter_id = u.id AND u.role IN ('Recruiter','recruiter')
        LEFT JOIN job_applications ja ON ja.job_id = jp.id
        WHERE jp.recruiter_id = ?
        GROUP BY jp.id
        ORDER BY jp.created_at DESC
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $recruiter_id);
    $stmt->execute();
    $res = $stmt->get_result();

    $rows = [];
    while ($res && ($row = $res->fetch_assoc())) {
        $tags = [];
        if (!empty($row["tags"])) {
            $decoded = json_decode($row["tags"], true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $tags = $decoded;
            }
        }
        $row["tags"] = $tags;
        $row["applicant_count"] = (int)($row["applicant_count"] ?? 0);
        $row["pending_count"] = (int)($row["pending_count"] ?? 0);
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
