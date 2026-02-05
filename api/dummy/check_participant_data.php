<?php
require 'db_connect.php';

$sql = "SELECT u.name, u.email, p.university, p.skills, p.github 
        FROM users u 
        JOIN participant_profiles p ON u.id = p.user_id 
        ORDER BY u.created_at DESC LIMIT 1";

$result = $conn->query($sql);

if ($result->num_rows > 0) {
    echo "Latest Participant Data:\n";
    print_r($result->fetch_assoc());
} else {
    echo "No participant profiles found.";
}

$conn->close();
?>