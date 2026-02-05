<?php
// (maintenance) moved out of production API endpoints.
include_once 'db_connect.php';
header('Content-Type: text/plain');

$res = $conn->query("DESCRIBE sponsorship_applications");
if ($res) {
    while ($row = $res->fetch_assoc()) {
        echo "FIELD: {$row['Field']} | TYPE: {$row['Type']} | NULL: {$row['Null']} | KEY: {$row['Key']}\n";
    }
} else {
    echo "ERROR: " . $conn->error;
}
$conn->close();
?>
