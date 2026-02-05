<?php
require 'db_connect.php';

$sql = "SELECT u.name, u.email, op.organization_name, op.website, op.is_institution 
        FROM users u 
        JOIN organizer_profiles op ON u.id = op.user_id 
        ORDER BY u.created_at DESC LIMIT 1";

$result = $conn->query($sql);

if ($result->num_rows > 0) {
    echo "Last inserted organizer:\n";
    print_r($result->fetch_assoc());
} else {
    echo "No organizer found.";
}

$conn->close();
?>