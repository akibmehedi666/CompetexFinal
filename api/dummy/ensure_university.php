<?php
require 'db_connect.php';

// Add university column if it doesn't exist
$sql = "ALTER TABLE users ADD COLUMN IF NOT EXISTS university VARCHAR(255)";

if ($conn->query($sql) === TRUE) {
    echo "University column check/add completed successfully.\n";
} else {
    echo "Error checking/adding university column: " . $conn->error . "\n";
}

$conn->close();
?>