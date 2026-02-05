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

// Create sponsorship_requests table (Organizer -> Sponsor)
$run(
    "CREATE TABLE IF NOT EXISTS sponsorship_requests (
        id CHAR(36) NOT NULL,
        organizer_id CHAR(36) NOT NULL,
        sponsor_id CHAR(36) NOT NULL,
        event_id CHAR(36) NOT NULL,
        requested_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        message TEXT DEFAULT NULL,
        status ENUM('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uniq_org_sponsor_event (organizer_id, sponsor_id, event_id),
        KEY idx_sponsor_status (sponsor_id, status),
        KEY idx_organizer_created (organizer_id, created_at),
        KEY idx_event (event_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci",
    "Create sponsorship_requests"
);

// Best-effort foreign keys (safe to ignore failures if constraints already exist or incompatible)
$run("ALTER TABLE sponsorship_requests ADD CONSTRAINT fk_sr_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE", "FK sponsorship_requests.event_id -> events.id");
$run("ALTER TABLE sponsorship_requests ADD CONSTRAINT fk_sr_org FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE", "FK sponsorship_requests.organizer_id -> users.id");
$run("ALTER TABLE sponsorship_requests ADD CONSTRAINT fk_sr_sponsor FOREIGN KEY (sponsor_id) REFERENCES sponsor_profiles(id) ON DELETE CASCADE", "FK sponsorship_requests.sponsor_id -> sponsor_profiles.id");

echo json_encode(["status" => "success", "messages" => $messages]);
$conn->close();

