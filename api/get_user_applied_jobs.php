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

$user_id = isset($_GET['user_id']) ? trim((string)$_GET['user_id']) : '';
if ($user_id === '') {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing user_id"]);
    $conn->close();
    exit();
}

// Expects schema to be provisioned from competex_db.sql (no table creation at runtime).

try {
    $sql = "
        SELECT
            ja.job_id,
            ja.status,
            ja.created_at
        FROM job_applications ja
        WHERE ja.applicant_id = ?
        ORDER BY ja.created_at DESC
    ";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $user_id);
    $stmt->execute();
    $res = $stmt->get_result();

    $rows = [];
    while ($res && ($row = $res->fetch_assoc())) {
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
