<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'db_connect.php';

$table = 'users';
$schema = [];

$result = $conn->query("DESCRIBE $table");
if ($result) {
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }
    $schema[$table] = $rows;
} else {
    $schema[$table] = "Error: " . $conn->error;
}

// Also check table status to see Engine
$status_result = $conn->query("SHOW TABLE STATUS LIKE '$table'");
if ($status_result) {
    $schema[$table . '_status'] = $status_result->fetch_assoc();
}

$status_team = $conn->query("SHOW TABLE STATUS LIKE 'teams'");
if ($status_team) {
    $schema['teams_status'] = $status_team->fetch_assoc();
}

echo json_encode($schema);
?>