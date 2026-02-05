<?php
require 'db_connect.php';

// Add new columns if they don't exist
$alter_statements = [
    "ADD COLUMN IF NOT EXISTS bio TEXT",
    "ADD COLUMN IF NOT EXISTS linkedin VARCHAR(255)",
    "ADD COLUMN IF NOT EXISTS portfolio VARCHAR(255)",
    "ADD COLUMN IF NOT EXISTS profile_visibility ENUM('public', 'private', 'connections') DEFAULT 'public'",
    "ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE",
    "ADD COLUMN IF NOT EXISTS avatar LONGTEXT" // Ensure avatar exists, using LONGTEXT for base64
];

foreach ($alter_statements as $statement) {
    $sql = "ALTER TABLE users " . $statement;
    if ($conn->query($sql) === TRUE) {
        echo "Column added or already exists: " . $statement . "\n";
    } else {
        echo "Error altering table with '$statement': " . $conn->error . "\n";
    }
}

echo "Database schema update completed.\n";

$conn->close();
?>