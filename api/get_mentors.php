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
        mp.id AS mentor_profile_id,
        mp.user_id,
        COALESCE(mp.name, u.name) AS name,
        mp.position,
        mp.company_name,
        mp.bio,
        mp.expertise,
        mp.years_experience,
        mp.linkedin,
        mp.website,
        u.avatar,
        u.location,
        u.verified
    FROM mentor_profiles mp
    JOIN users u ON u.id = mp.user_id
    WHERE u.role IN ('Mentor','mentor')
    ORDER BY COALESCE(mp.name, u.name) ASC
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
    $expertise = [];
    if (!empty($row["expertise"])) {
        $decoded = json_decode($row["expertise"], true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            $expertise = $decoded;
        }
    }
    $row["expertise"] = $expertise;
    $row["verified"] = (bool)intval($row["verified"] ?? 0);
    $rows[] = $row;
}

echo json_encode(["status" => "success", "data" => $rows]);
$conn->close();
?>

