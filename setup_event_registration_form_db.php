<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once 'api/db_connect.php';

$messages = [];

$run = function(string $sql, string $label) use ($conn, &$messages) {
    if ($conn->query($sql) === TRUE) {
        $messages[] = "[OK] " . $label;
        return true;
    }
    $messages[] = "[ERR] " . $label . ": " . $conn->error;
    return false;
};

// 1) Ensure events.registration_fee exists
$col = $conn->query("SHOW COLUMNS FROM events LIKE 'registration_fee'");
if (!$col || $col->num_rows === 0) {
    $run("ALTER TABLE events ADD COLUMN registration_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00", "Add events.registration_fee");
} else {
    $messages[] = "[OK] events.registration_fee exists";
}

// 2) Create event_registration_forms
$run(
    "CREATE TABLE IF NOT EXISTS event_registration_forms (
        id CHAR(36) NOT NULL,
        request_id VARCHAR(50) NOT NULL,
        event_id CHAR(36) NOT NULL,
        user_id CHAR(36) NOT NULL,
        team_id CHAR(36) DEFAULT NULL,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(30) DEFAULT NULL,
        university VARCHAR(255) DEFAULT NULL,
        transaction_id VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uniq_request (request_id),
        KEY idx_event (event_id),
        KEY idx_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci",
    "Create event_registration_forms"
);

// 3) Create event_participants (used by existing approval flow)
$run(
    "CREATE TABLE IF NOT EXISTS event_participants (
        id VARCHAR(50) NOT NULL,
        event_id VARCHAR(50) NOT NULL,
        user_id VARCHAR(50) NOT NULL,
        enrolled_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uniq_event_user (event_id, user_id),
        KEY idx_event (event_id),
        KEY idx_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci",
    "Create event_participants"
);

// 4) Ensure notifications.reference_id exists (optional, for deep-linking)
$notifTable = $conn->query("SHOW TABLES LIKE 'notifications'");
if ($notifTable && $notifTable->num_rows > 0) {
    $notifCol = $conn->query("SHOW COLUMNS FROM notifications LIKE 'reference_id'");
    if (!$notifCol || $notifCol->num_rows === 0) {
        $run("ALTER TABLE notifications ADD COLUMN reference_id CHAR(36) DEFAULT NULL", "Add notifications.reference_id");
        $run("CREATE INDEX idx_user_reference ON notifications (user_id, reference_id)", "Add notifications idx_user_reference");
    } else {
        $messages[] = "[OK] notifications.reference_id exists";
    }
} else {
    $messages[] = "[INFO] notifications table not found (will be created by invitations/notifications setup).";
}

echo json_encode(["status" => "success", "messages" => $messages]);
$conn->close();

