<?php
// (maintenance) moved out of production API endpoints.
include_once 'db_connect.php';
header('Content-Type: text/plain');
$res = $conn->query("DESCRIBE sponsor_profiles");
while ($row = $res->fetch_assoc()) {
    echo "FIELD: {$row['Field']} | TYPE: {$row['Type']}\n";
}
$conn->close();
?>
