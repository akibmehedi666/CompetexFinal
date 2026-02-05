<?php
// (maintenance) moved out of production API endpoints.
include_once 'db_connect.php';
header('Content-Type: text/html');

echo "<style>table, th, td { border: 1px solid black; border-collapse: collapse; padding: 5px; }</style>";
echo "<h2>🔍 Deep Dive Debugger</h2>";

// 1. List All Events & Organizers
echo "<h3>1. Events & Organizers</h3>";
$res = $conn->query("SELECT id, title, organizer_id FROM events");
if ($res->num_rows > 0) {
    echo "<table><tr><th>Event ID</th><th>Title</th><th>Organizer ID (Owner)</th></tr>";
    while ($row = $res->fetch_assoc()) {
        echo "<tr><td>{$row['id']}</td><td>{$row['title']}</td><td><b>{$row['organizer_id']}</b></td></tr>";
    }
    echo "</table>";
} else {
    echo "❌ No events found.<br>";
}

// 2. List All Sponsorship Requests
echo "<h3>2. Sponsorship Requests (Raw)</h3>";
$res2 = $conn->query("SELECT id, event_id, sponsor_id, status, amount, contact_email, contact_phone FROM sponsorship_applications");
if ($res2->num_rows > 0) {
    echo "<table><tr><th>Request ID</th><th>Event ID</th><th>Sponsor ID</th><th>Status</th><th>Amount</th><th>Email</th><th>Phone</th></tr>";
    while ($row = $res2->fetch_assoc()) {
        echo "<tr><td>{$row['id']}</td><td>{$row['event_id']}</td><td>{$row['sponsor_id']}</td><td>{$row['status']}</td><td>{$row['amount']}</td><td>{$row['contact_email']}</td><td>{$row['contact_phone']}</td></tr>";
    }
    echo "</table>";
} else {
    echo "❌ No requests found.<br>";
}

// 3. Match Logic Check
echo "<h3>3. Match Logic (Why isn't it showing?)</h3>";
echo "<p>If you are logged in as Organizer X, you should see requests for events owned by Organizer X.</p>";

$res3 = $conn->query("SELECT sa.id, sa.status, sa.amount, e.title, e.organizer_id 
                      FROM sponsorship_applications sa 
                      LEFT JOIN events e ON sa.event_id = e.id");

if ($res3->num_rows > 0) {
    echo "<table><tr><th>Request ID</th><th>Linked Event</th><th>Owner ID (Organizer)</th><th>Status</th></tr>";
    while ($row = $res3->fetch_assoc()) {
        echo "<tr>";
        echo "<td>{$row['id']}</td>";
        echo "<td>{$row['title']}</td>";
        echo "<td><span style='background:yellow'>{$row['organizer_id']}</span></td>";
        echo "<td>{$row['status']}</td>";
        echo "</tr>";
    }
    echo "</table>";
    echo "<p><b>Check:</b> Is the 'Owner ID' highlighted above the SAME as your logged-in user ID?</p>";
} else {
    echo "No matched data.<br>";
}

$conn->close();
?>
