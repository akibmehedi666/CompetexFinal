<?php
// (maintenance) moved out of production API endpoints.
include_once 'db_connect.php';
header('Content-Type: text/plain');

$sql = "SELECT sa.id, sa.event_id, sa.sponsor_id, sa.status, sa.amount, e.organizer_id, e.title
        FROM sponsorship_applications sa 
        LEFT JOIN events e ON sa.event_id = e.id";

$res = $conn->query($sql);

if ($res) {
    echo "Rows: " . $res->num_rows . "\n";
    while ($row = $res->fetch_assoc()) {
        echo "APP: " . $row['id'] . " | EV: " . $row['event_id'] . " | TITLE: " . $row['title'] . " | SPON: " . $row['sponsor_id'] . " | STAT: " . $row['status'] . " | VAL: " . $row['amount'] . " | ORG: " . $row['organizer_id'] . "\n";
    }
} else {
    echo "ERROR: " . $conn->error;
}
$conn->close();
?>
