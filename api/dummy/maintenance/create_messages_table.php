<?php
// (maintenance) moved out of production API endpoints.
require 'db_connect.php';

$sql = "CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(50) PRIMARY KEY,
    sender_id VARCHAR(50) NOT NULL,
    recipient_id VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (recipient_id) REFERENCES users(id)
)";

if ($conn->query($sql) === TRUE) {
    echo "Table messages created successfully";
} else {
    echo "Error creating table: " . $conn->error;
}

$conn->close();
?>
