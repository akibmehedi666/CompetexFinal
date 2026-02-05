<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "competex_db";

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die(json_encode(["error" => "Connection failed: " . $e->getMessage()]));
}

$response = [];

// 1. Check schema of participant_profiles
try {
    $stmt = $conn->query("DESCRIBE participant_profiles");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $response['participant_profiles_columns'] = $columns;
} catch (PDOException $e) {
    $response['schema_error'] = $e->getMessage();
}

// 2. Check data consistency
try {
    $stmt = $conn->query("SELECT user_id, bio, department, verified, name FROM participant_profiles LIMIT 5");
    $response['sample_data'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Count comparison
    $userCountStmt = $conn->query("SELECT count(*) FROM users WHERE role = 'Participant'");
    $profileCountStmt = $conn->query("SELECT count(*) FROM participant_profiles");

    $response['counts'] = [
        'users_participant_role' => $userCountStmt->fetchColumn(),
        'participant_profiles_rows' => $profileCountStmt->fetchColumn()
    ];

} catch (PDOException $e) {
    $response['data_error'] = $e->getMessage();
}

echo json_encode($response, JSON_PRETTY_PRINT);
?>