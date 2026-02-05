<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'db_connect.php';

$alter_queries = [
    "ALTER TABLE teams ADD COLUMN description TEXT NULL",
    "ALTER TABLE teams ADD COLUMN project_idea TEXT NULL",
    "ALTER TABLE teams ADD COLUMN status VARCHAR(50) DEFAULT 'open'",
    "ALTER TABLE teams ADD COLUMN required_skills LONGTEXT NULL COMMENT '(DC2Type:json)'"
];

$results = [];

foreach ($alter_queries as $query) {
    if ($conn->query($query) === TRUE) {
        $results[] = ["query" => $query, "status" => "success"];
    } else {
        $results[] = ["query" => $query, "status" => "error", "message" => $conn->error];
    }
}

echo json_encode(["migration_results" => $results]);
?>