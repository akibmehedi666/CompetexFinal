<?php
require 'db_connect.php';

$sql = "ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255) NOT NULL AFTER email";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["status" => "success", "message" => "Table users updated successfully"]);
} else {
    echo json_encode(["status" => "error", "message" => "Error updating table: " . $conn->error]);
}

$conn->close();
?>