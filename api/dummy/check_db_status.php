<?php
header('Content-Type: text/plain');

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "competex_db";
$port = 3306;

// Disable default error reporting to handle it manually
error_reporting(0);
mysqli_report(MYSQLI_REPORT_OFF);

echo "Attempting connection to $dbname on $servername:$port...\n";

$conn = new mysqli($servername, $username, $password, $dbname, $port);

if ($conn->connect_error) {
    echo "❌ Connection Failed: " . $conn->connect_error . "\n";
    exit(1);
}

echo "✅ Connection Successful!\n\n";

echo "Fetching tables...\n";
$result = $conn->query("SHOW TABLES");

if ($result) {
    if ($result->num_rows > 0) {
        echo "Found " . $result->num_rows . " tables:\n";
        while ($row = $result->fetch_array()) {
            echo "- " . $row[0] . "\n";
        }
    } else {
        echo "⚠ Database is empty (no tables found).\n";
    }
} else {
    echo "❌ Error listing tables: " . $conn->error . "\n";
}

$conn->close();
?>