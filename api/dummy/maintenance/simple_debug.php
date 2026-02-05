<?php
// (maintenance) moved out of production API endpoints.
include_once 'db_connect.php';
header('Content-Type: text/plain');

$res = $conn->query("SELECT sa.id, sa.event_id, sa.sponsor_id, sa.status, sa.amount, e.organizer_id 
                    FROM sponsorship_applications sa 
                    LEFT JOIN events e ON sa.event_id = e.id");

if ($res) {
    echo "ID | EventID | SponsorID | Status | Value | OrgID\n";
    echo "---------------------------------------------------\n";
    while ($row = $res->fetch_assoc()) {
        echo "{$row['id']} | {$row['event_id']} | {$row['sponsor_id']} | {$row['status']} | {$row['amount']} | {$row['organizer_id']}\n";
    }
} else {
    echo "Error: " . $conn->error;
}

$conn->close();
?>
