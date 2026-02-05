<?php
include_once 'db_connect.php';

header("Content-Type: application/json");

$response = [];

// 1. event_requests table
$sql_requests = "CREATE TABLE IF NOT EXISTS event_requests (
    id VARCHAR(50) PRIMARY KEY,
    event_id VARCHAR(50) NOT NULL,
    team_id VARCHAR(50) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
)";

if ($conn->query($sql_requests) === TRUE) {
    $response['event_requests'] = "Table created or already exists";
} else {
    $response['event_requests'] = "Error: " . $conn->error;
}

// 2. event_teams table (Official Participation)
$sql_teams = "CREATE TABLE IF NOT EXISTS event_teams (
    id VARCHAR(50) PRIMARY KEY,
    event_id VARCHAR(50) NOT NULL,
    team_id VARCHAR(50) NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (event_id, team_id)
)";

if ($conn->query($sql_teams) === TRUE) {
    $response['event_teams'] = "Table created or already exists";
} else {
    $response['event_teams'] = "Error: " . $conn->error;
}

echo json_encode($response);
$conn->close();
?>