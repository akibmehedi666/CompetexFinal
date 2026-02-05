<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'db_connect.php';

$sql = "SELECT * FROM participant_profiles ORDER BY created_at DESC LIMIT 1";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    echo json_encode($result->fetch_assoc(), JSON_PRETTY_PRINT);
} else {
    echo json_encode(["message" => "No profiles found"]);
}
?>