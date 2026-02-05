<?php
$servername = "127.0.0.1";
$username = "root";
$password = "";
$dbname = "competexdatabase";
$port = 3308;

mysqli_report(MYSQLI_REPORT_OFF);
$conn = new mysqli($servername, $username, $password, $dbname, $port);

if ($conn->connect_error) {
    echo "FAILED: " . $conn->connect_error;
} else {
    echo "SUCCESS: Connected to database on port 3308";
}
?>
