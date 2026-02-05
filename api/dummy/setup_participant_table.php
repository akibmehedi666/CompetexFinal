<?php
require 'db_connect.php';

// SQL to create table
$sql = "CREATE TABLE IF NOT EXISTS participant_profiles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    university VARCHAR(255),
    skills TEXT,
    github VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)";

if ($conn->query($sql) === TRUE) {
    echo "Table 'participant_profiles' created successfully (or already exists).";
} else {
    echo "Error creating table: " . $conn->error;
}

$conn->close();
?>