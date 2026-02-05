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

$mentor_profile_id = isset($_GET['mentor_profile_id']) ? trim((string)$_GET['mentor_profile_id']) : '';
if ($mentor_profile_id === '') {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing mentor_profile_id"]);
    $conn->close();
    exit();
}

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
    WHERE mp.id = ?
      AND u.role IN ('Mentor','mentor')
    LIMIT 1
";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $conn->error]);
    $conn->close();
    exit();
}

$stmt->bind_param("s", $mentor_profile_id);
$stmt->execute();
$res = $stmt->get_result();

if (!$res || $res->num_rows === 0) {
    http_response_code(404);
    echo json_encode(["status" => "error", "message" => "Mentor not found"]);
    $stmt->close();
    $conn->close();
    exit();
}

$row = $res->fetch_assoc();
$stmt->close();

$expertise = [];
if (!empty($row["expertise"])) {
    $decoded = json_decode($row["expertise"], true);
    if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
        $expertise = $decoded;
    }
}
$row["expertise"] = $expertise;
$row["verified"] = (bool)intval($row["verified"] ?? 0);

echo json_encode(["status" => "success", "data" => $row]);
$conn->close();
?>

