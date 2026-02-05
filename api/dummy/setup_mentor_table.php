<?php
// setup_mentor_table.php
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    if (!file_exists('db_connect.php')) {
        throw new Exception("db_connect.php not found");
    }
    require 'db_connect.php';

    // Drop table if exists
    $sql_drop = "DROP TABLE IF EXISTS mentor_profiles";
    if ($conn->query($sql_drop) === TRUE) {
        echo "Dropped 'mentor_profiles' table.<br>";
    } else {
        throw new Exception("Error dropping table: " . $conn->error);
    }

    // Create new table
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
        echo "Table 'mentor_profiles' created successfully.<br>";
    } else {
        throw new Exception("Error creating table: " . $conn->error);
    }
    $conn->close();

} catch (Throwable $t) {
    echo "FATAL ERROR: " . $t->getMessage() . "<br>";
    echo "Trace: " . $t->getTraceAsString();
}
?>