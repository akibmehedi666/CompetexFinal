<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'db_connect.php';

$table = 'events';
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

echo json_encode($schema);
?>