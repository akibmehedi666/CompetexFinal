<?php
// (maintenance) moved out of production API endpoints.
include_once 'db_connect.php';
header('Content-Type: text/plain');

$res = $conn->query("SELECT id, name, email FROM users WHERE role = 'Organizer'");
echo "--- ORGANIZERS ---\n";
while ($row = $res->fetch_assoc()) {
    echo "NAME: {$row['name']} | EMAIL: {$row['email']} | ID: {$row['id']}\n";
}

echo "\n--- EVENTS & OWNERS ---\n";
$res_ev = $conn->query("SELECT id, title, organizer_id FROM events");
while ($row = $res_ev->fetch_assoc()) {
    echo "EVENT: {$row['title']} | OWNER_ID: {$row['organizer_id']}\n";
}

$conn->close();
?>
