<?php
// (maintenance) moved out of production API endpoints.
include_once 'db_connect.php';

echo "<h2>Seeding Sponsorship Data...</h2>";

// 1. Create a Sponsor Profile if none exists
$user_id = 'user_sponsor_demo'; // Mock user
$sponsor_id = 'sp_demo_01';

// Check if user exists, if not create basic user
$check_user = $conn->query("SELECT id FROM users WHERE id = '$user_id'");
if ($check_user->num_rows == 0) {
    $conn->query("INSERT INTO users (id, name, email, role) VALUES ('$user_id', 'Demo Sponsor', 'sponsor@demo.com', 'Sponsor')");
    echo "Created demo user.<br>";
}

// Check/Create Sponsor Profile
$check_sp = $conn->query("SELECT id FROM sponsor_profiles WHERE id = '$sponsor_id'");
if ($check_sp->num_rows == 0) {
    $conn->query("INSERT INTO sponsor_profiles (id, user_id, company_name, industry) VALUES ('$sponsor_id', '$user_id', 'Demo Corp', 'Tech')");
    echo "Created demo sponsor profile.<br>";
}

// 2. Get an existing Event ID (referenced by an organizer)
// We need an event that belongs to the CURRENT logged-in organizer for them to see it.
// Since I don't know the exact organizer ID logged in, I will look for ANY event.
$res_event = $conn->query("SELECT id, title, organizer_id FROM events LIMIT 1");
if ($res_event->num_rows > 0) {
    $event = $res_event->fetch_assoc();
    $event_id = $event['id'];
    $event_title = $event['title'];
    $organizer_id = $event['organizer_id'];

    echo "Found Event: $event_title (ID: $event_id, Org: $organizer_id)<br>";

    // 3. Create Sponsorship Request
    $req_id = uniqid('app_seed_');
    $amount = 5000;
    $message = "We would love to sponsor your event!";
    $contact_email = "sponsor@demo.com";
    $contact_phone = "1234567890";

    $sql = "INSERT INTO sponsorship_applications (id, event_id, sponsor_id, status, amount, contact_email, contact_phone, message)
            VALUES ('$req_id', '$event_id', '$sponsor_id', 'pending', '$amount', '$contact_email', '$contact_phone', '$message')";

    if ($conn->query($sql)) {
        echo "✅ Successfully created sponsorship request ($req_id) for Event '$event_title'.<br>";
        echo "<b>Login as Organizer ($organizer_id) to see this request!</b>";
    } else {
        echo "❌ Error creating request: " . $conn->error;
    }

} else {
    echo "❌ No events found in database. Please create an event first.";
}

$conn->close();
?>
