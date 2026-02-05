<?php
// (maintenance) moved out of production API endpoints.
// One-time script to fix database schema
include_once 'db_connect.php';

echo "Checking schema...<br>";

function ensureColumn(mysqli $conn, string $column, string $ddl): void {
    $res = $conn->query("SHOW COLUMNS FROM sponsorship_applications LIKE '{$conn->real_escape_string($column)}'");
    if ($res && $res->num_rows === 0) {
        echo "Column '{$column}' missing. Adding it...<br>";
        if ($conn->query("ALTER TABLE sponsorship_applications ADD COLUMN {$ddl}")) {
            echo "Successfully added '{$column}'.<br>";
        } else {
            echo "Error adding '{$column}': " . $conn->error . "<br>";
        }
    } else {
        echo "Column '{$column}' already exists.<br>";
    }
}

// Required fields for sponsorship requests (sponsor -> organizer)
ensureColumn($conn, "sponsor_id", "sponsor_id CHAR(36) NULL AFTER event_id");
ensureColumn($conn, "amount", "amount DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER sponsor_id");
ensureColumn($conn, "contact_email", "contact_email VARCHAR(255) NOT NULL DEFAULT '' AFTER amount");
ensureColumn($conn, "contact_phone", "contact_phone VARCHAR(30) NOT NULL DEFAULT '' AFTER contact_email");

// Normalize legacy status values if they exist, then enforce default pending.
$conn->query("UPDATE sponsorship_applications SET status='pending' WHERE status='submitted'");
$conn->query("ALTER TABLE sponsorship_applications MODIFY COLUMN status ENUM('pending','accepted','rejected','completed') NOT NULL DEFAULT 'pending'");

// Enforce required foreign key columns as NOT NULL if safe (no existing NULL rows).
$nullsRes = $conn->query("SELECT SUM(event_id IS NULL) AS null_event_id, SUM(sponsor_id IS NULL) AS null_sponsor_id FROM sponsorship_applications");
if ($nullsRes) {
    $nulls = $nullsRes->fetch_assoc();
    if ((int)$nulls['null_event_id'] === 0) {
        $conn->query("ALTER TABLE sponsorship_applications MODIFY COLUMN event_id CHAR(36) NOT NULL");
    } else {
        echo "WARNING: event_id has NULL rows; leaving it nullable.<br>";
    }
    if ((int)$nulls['null_sponsor_id'] === 0) {
        $conn->query("ALTER TABLE sponsorship_applications MODIFY COLUMN sponsor_id CHAR(36) NOT NULL");
    } else {
        echo "WARNING: sponsor_id has NULL rows; leaving it nullable.<br>";
    }
}

// Add sponsor_id FK if missing (safe to ignore errors if already exists).
$fk = $conn->query("SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
                    WHERE TABLE_SCHEMA = DATABASE()
                      AND TABLE_NAME = 'sponsorship_applications'
                      AND COLUMN_NAME = 'sponsor_id'
                      AND REFERENCED_TABLE_NAME IS NOT NULL");
if ($fk && $fk->num_rows === 0) {
    echo "Foreign key for sponsor_id missing. Adding it...<br>";
    $conn->query("ALTER TABLE sponsorship_applications ADD INDEX sponsor_id (sponsor_id)");
    if ($conn->query("ALTER TABLE sponsorship_applications ADD CONSTRAINT sponsorship_applications_ibfk_3 FOREIGN KEY (sponsor_id) REFERENCES sponsor_profiles(id)")) {
        echo "Successfully added sponsor_id foreign key.<br>";
    } else {
        echo "Error adding sponsor_id foreign key: " . $conn->error . "<br>";
    }
} else {
    echo "Foreign key for sponsor_id already exists.<br>";
}

echo "Schema fix check complete.";
$conn->close();
?>
