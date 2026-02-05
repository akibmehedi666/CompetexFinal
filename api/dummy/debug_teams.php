<?php
header("Content-Type: text/plain");
include_once 'db_connect.php';

$result = $conn->query("SHOW CREATE TABLE teams");
$row = $result->fetch_assoc();
print_r($row);

echo "\n\nCHECKING LEADER ID VALUE AGAIN:\n";
$uid = "6635c06e-22c9-4807-a99e-a3bf3d730a87";
$res = $conn->query("SELECT id, HEX(id), LENGTH(id) FROM users WHERE id = '$uid'");
$u = $res->fetch_assoc();
print_r($u);
?>