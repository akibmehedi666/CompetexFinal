<?php
require 'db_connect.php';

// Add name column to mentor_profiles
$sql = "ALTER TABLE mentor_profiles ADD COLUMN name VARCHAR(255) AFTER user_id";

if ($conn->query($sql) === TRUE) {
    echo "Table 'mentor_profiles' altered successfully: Added 'name' column.<br>";
} else {
    echo "Error altering table: " . $conn->error . "<br>";
}

$conn->close();
?>