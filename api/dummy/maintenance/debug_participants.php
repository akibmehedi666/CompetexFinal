<?php
// (maintenance) moved out of production API endpoints.
error_reporting(E_ALL);
ini_set('display_errors', 1);
require 'db_connect.php';

echo "<h2>Debug Participant Data</h2>";

// 1. Check raw users table
$sql = "SELECT id, name, email, role FROM users";
$result = $conn->query($sql);

echo "<h3>All Users (" . $result->num_rows . ")</h3>";
if ($result->num_rows > 0) {
    echo "<table border='1'><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th></tr>";
    while ($row = $result->fetch_assoc()) {
        echo "<tr>";
        echo "<td>" . $row["id"] . "</td>";
        echo "<td>" . $row["name"] . "</td>";
        echo "<td>" . $row["email"] . "</td>";
        echo "<td>'" . $row["role"] . "'</td>"; // Quote role to see whitespace
        echo "</tr>";
    }
    echo "</table>";
} else {
    echo "No users found in users table.<br>";
}

// 2. Check participant_profiles
$sql = "SELECT user_id, name FROM participant_profiles";
$result = $conn->query($sql);
echo "<h3>Participant Profiles (" . $result->num_rows . ")</h3>";
if ($result->num_rows > 0) {
    echo "<table border='1'><tr><th>User ID</th><th>Name</th></tr>";
    while ($row = $result->fetch_assoc()) {
        echo "<tr><td>" . $row["user_id"] . "</td><td>" . $row["name"] . "</td></tr>";
    }
    echo "</table>";
}

// 3. Test the main query
echo "<h3>Testing Main Query</h3>";
$sql = "SELECT 
            u.id, 
            u.email, 
            u.role, 
            pp.name as profile_name
        FROM users u
        LEFT JOIN participant_profiles pp ON u.id = pp.user_id
        WHERE u.role = 'Participant'";

$result = $conn->query($sql);
if (!$result) {
    echo "Query Error: " . $conn->error;
} else {
    echo "Found " . $result->num_rows . " participants with role 'Participant'.<br>";
}

$conn->close();
?>
