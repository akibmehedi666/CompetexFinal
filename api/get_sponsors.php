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

$sql = "
    SELECT
        sp.id AS sponsor_profile_id,
        sp.user_id AS sponsor_user_id,
        COALESCE(sp.company_name, u.name) AS sponsor_name,
        sp.company_name,
        sp.industry,
        sp.description,
        sp.website,
        sp.location,
        sp.sponsorship_categories,
        sp.verified,
        u.email,
        u.avatar
    FROM sponsor_profiles sp
    JOIN users u ON sp.user_id = u.id
    WHERE u.role = 'Sponsor'
    ORDER BY COALESCE(sp.company_name, u.name) ASC
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
    $cats = [];
    if (!empty($row['sponsorship_categories'])) {
        $decoded = json_decode($row['sponsorship_categories'], true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            $cats = $decoded;
        }
    }
    $row['sponsorship_categories'] = $cats;
    $rows[] = $row;
}

echo json_encode(["status" => "success", "data" => $rows]);
$conn->close();
?>

