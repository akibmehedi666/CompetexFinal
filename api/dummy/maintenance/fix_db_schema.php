<?php
// (maintenance) moved out of production API endpoints.
require_once 'db_connect.php';

header("Content-Type: text/plain");

function run_query($conn, $sql, $description)
{
    echo "Running: $description...\n";
    if ($conn->query($sql) === TRUE) {
        echo "[SUCCESS] $description\n";
    } else {
        echo "[ERROR] $description: " . $conn->error . "\n";
    }
    echo "---------------------------------------------------\n";
}

echo "Starting Database Fix...\n\n";

// 1. Drop the foreign key constraint
run_query(
    $conn,
    "ALTER TABLE event_requests DROP FOREIGN KEY event_requests_ibfk_2",
    "Drop Foreign Key 'event_requests_ibfk_2'"
);

// 2. Modify the column to be NULL
run_query(
    $conn,
    "ALTER TABLE event_requests MODIFY team_id VARCHAR(255) NULL",
    "Modify 'team_id' to be NULL"
);

// 3. Re-add the foreign key constraint
run_query(
    $conn,
    "ALTER TABLE event_requests ADD CONSTRAINT event_requests_ibfk_2 FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE",
    "Re-add Foreign Key constraint"
);

echo "\nDatabase Fix Completed.";
$conn->close();
?>
