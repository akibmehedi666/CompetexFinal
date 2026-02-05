<?php
require 'db_connect.php';

// SQL to create recruiter_profiles table
$sql = "CREATE TABLE IF NOT EXISTS recruiter_profiles (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36),
    company_name VARCHAR(255),
    position VARCHAR(255),
    department VARCHAR(255),
    website TEXT,
    linkedin TEXT,
    location TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)";

// Check if connection is valid
if (isset($conn) && $conn instanceof mysqli) {
    if ($conn->query($sql) === TRUE) {
        echo "Table 'recruiter_profiles' created successfully or already exists.<br>";
    } else {
        echo "Error creating table: " . $conn->error . "<br>";
    }
    $conn->close();
} else {
    echo "Database connection failed or invalid.<br>";
}
?>