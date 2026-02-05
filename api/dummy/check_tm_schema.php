<?php
header("Content-Type: text/plain");
include_once 'db_connect.php';

$result = $conn->query("SHOW CREATE TABLE team_members");
if ($result) {
    $row = $result->fetch_assoc();
    print_r($row);
} else {
    echo "Error: " . $conn->error;
}
?>