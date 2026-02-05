<?php
// (maintenance) moved out of production API endpoints.
error_reporting(E_ALL);
ini_set('display_errors', 1);
require 'db_connect.php';

echo "<h2>Debug Complex Query</h2>";

$sql = "SELECT 
            u.id, 
            u.email, 
            u.role, 
            u.avatar as user_avatar,
            u.name as user_name,
            u.verified as user_verified,
            pp.name as profile_name, 
            pp.university, 
            pp.location, 
            pp.skills, 
            pp.avatar as profile_avatar, 
            pp.verified as profile_verified,
            GROUP_CONCAT(DISTINCT e.title SEPARATOR '||') as competitions
        FROM users u
        LEFT JOIN participant_profiles pp ON u.id = pp.user_id
        LEFT JOIN event_participants ep ON u.id = ep.user_id
        LEFT JOIN events e ON ep.event_id = e.id
        WHERE u.role = 'Participant'
        GROUP BY u.id";

echo "<pre>$sql</pre>";

$result = $conn->query($sql);

if (!$result) {
    echo "<h3>Query FAILED</h3>";
    echo "Error: " . $conn->error;
} else {
    echo "<h3>Query SUCCESS</h3>";
    echo "Rows found: " . $result->num_rows;
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        echo "<pre>";
        print_r($row);
        echo "</pre>";
    }
}

$conn->close();
?>
