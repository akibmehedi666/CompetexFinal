<?php
require 'db_connect.php';

echo "<h2>Users (Last 5)</h2>";
$result = $conn->query("SELECT id, name, email, role FROM users ORDER BY created_at DESC LIMIT 5");
if ($result) {
    while ($row = $result->fetch_assoc()) {
        echo "ID: " . $row['id'] . " | Name: " . $row['name'] . " | Role: " . $row['role'] . "<br>";
    }
}

echo "<h2>Mentor Profiles</h2>";
$result = $conn->query("SELECT * FROM mentor_profiles");
if ($result) {
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            echo "User_ID: " . $row['user_id'] . " | Company: " . $row['company_name'] . " | Pos: " . $row['position'] . "<br>";
        }
    } else {
        echo "No mentor profiles found.<br>";
    }
} else {
    echo "Error: " . $conn->error;
}
$conn->close();
?>