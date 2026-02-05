<?php
// fix_mentor_table_final.php
// Self-contained script to forcefully fix the table

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "competex_db";

echo "Connecting to DB...\n";
$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
echo "Connected.\n";

// 1. Drop existing table
$sql_drop = "DROP TABLE IF EXISTS mentor_profiles";
if ($conn->query($sql_drop) === TRUE) {
    echo "Dropped 'mentor_profiles' table.\n";
} else {
    echo "Error dropping table: " . $conn->error . "\n";
}

// 2. Create new table with FULL schema
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
    echo "Table 'mentor_profiles' created successfully.\n";
} else {
    echo "Error creating table: " . $conn->error . "\n";
}

$conn->close();
?>