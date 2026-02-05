<?php
require 'db_connect.php';

// Add new columns for Organizer profile
$alter_statements = [
    "ADD COLUMN IF NOT EXISTS department VARCHAR(255)",
    "ADD COLUMN IF NOT EXISTS location VARCHAR(255)"
];

foreach ($alter_statements as $statement) {
    $sql = "ALTER TABLE users " . $statement;
    if ($conn->query($sql) === TRUE) {
        echo "Column added or already exists: " . $statement . "\n";
    } else {
        echo "Error altering table with '$statement': " . $conn->error . "\n";
    }
}

echo "Organizer schema update completed.\n";

$conn->close();
?>