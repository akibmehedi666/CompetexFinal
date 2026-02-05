<?php
require 'db_connect.php';

$sql_drop = "DROP TABLE IF EXISTS mentor_profiles";
if ($conn->query($sql_drop) === TRUE) {
    echo "Dropped.<br>";
} else {
    echo "Drop Error: " . $conn->error . "<br>";
}

$sql_create = "CREATE TABLE mentor_profiles (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36),
    company_name VARCHAR(255),
    position VARCHAR(255),
    expertise TEXT,
    years_experience INT,
    bio TEXT,
    linkedin TEXT,
    website TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)";

if ($conn->query($sql_create) === TRUE) {
    echo "Created.<br>";
} else {
    echo "Create Error: " . $conn->error . "<br>";
}
$conn->close();
?>