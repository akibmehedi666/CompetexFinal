<?php
include_once 'db_connect.php';

// Check if user_id exists
$check = $conn->query("SHOW COLUMNS FROM event_requests LIKE 'user_id'");

if ($check->num_rows == 0) {
    // Add user_id column
    $sql = "ALTER TABLE event_requests ADD COLUMN user_id VARCHAR(255) AFTER team_id";
    if ($conn->query($sql)) {
        echo "Successfully added user_id column to event_requests table.";
    } else {
        echo "Error adding column: " . $conn->error;
    }
} else {
    echo "user_id column already exists.";
}

$conn->close();
?>