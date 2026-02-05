<?php
require 'db_connect.php';

// Force drop by disabling FK checks
$conn->query("SET FOREIGN_KEY_CHECKS = 0");

$sql_drop = "DROP TABLE IF EXISTS mentor_profiles";
if ($conn->query($sql_drop) === TRUE) {
    echo "Dropped 'mentor_profiles'.<br>";
} else {
    echo "Drop Failed: " . $conn->error . "<br>";
}

// Re-enable FK
$conn->query("SET FOREIGN_KEY_CHECKS = 1");

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
    echo "Table 'mentor_profiles' created.<br>";
} else {
    echo "Create Failed: " . $conn->error . "<br>";
}
$conn->close();
?>