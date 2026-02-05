<?php
require 'db_connect.php';

// Drop table if exists to force fresh creation
$sql_drop = "DROP TABLE IF EXISTS mentor_profiles";
if ($conn->query($sql_drop) === TRUE) {
    echo "Old 'mentor_profiles' table dropped.<br>";
} else {
    echo "Error dropping table: " . $conn->error . "<br>";
}

// SQL to create mentor_profiles table
$sql = "CREATE TABLE mentor_profiles (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36),
    company_name VARCHAR(255),
    position VARCHAR(255),
    expertise TEXT, -- Stored as JSON or comma-separated string
    years_experience INT,
    bio TEXT,
    linkedin TEXT,
    website TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)";

// Check if connection is valid
if (isset($conn) && $conn instanceof mysqli) {
    if ($conn->query($sql) === TRUE) {
        echo "Table 'mentor_profiles' created successfully.<br>";
    } else {
        echo "Error creating table: " . $conn->error . "<br>";
    }
    $conn->close();
} else {
    echo "Database connection failed or invalid.<br>";
}
?>