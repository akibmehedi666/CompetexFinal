<?php
require 'db_connect.php';

echo "--- Columns in users table ---\n";
$result = $conn->query("SHOW COLUMNS FROM users");
while ($row = $result->fetch_assoc()) {
    echo $row['Field'] . " (" . $row['Type'] . ")\n";
}

echo "\n--- Content of university column for first 5 users ---\n";
$result = $conn->query("SELECT id, name, email, university FROM users LIMIT 5");
while ($row = $result->fetch_assoc()) {
    echo "User: " . $row['name'] . " (" . $row['email'] . ") - Uni: [" . ($row['university'] ?? 'NULL') . "]\n";
}

$conn->close();
?>