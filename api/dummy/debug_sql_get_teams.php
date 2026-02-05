<?php
header("Content-Type: text/plain");
include_once 'db_connect.php';

$sql = "SELECT t.*, 
        tm.user_id, tm.role as member_role, tm.joined_at,
        u.name as user_name, u.avatar as user_avatar, u.skills as user_skills
        FROM teams t
        LEFT JOIN team_members tm ON t.id = tm.team_id
        LEFT JOIN users u ON tm.user_id = u.id
        ORDER BY t.created_at DESC";

echo "Executing SQL:\n$sql\n\n";

$result = $conn->query($sql);

if ($result) {
    echo "Query Successful!\n";
    $count = 0;
    while ($row = $result->fetch_assoc()) {
        $count++;
        print_r($row);
        if ($count >= 2)
            break; // limit output
    }
    echo "Total Rows Processed (limit 2 shown).\n";
} else {
    echo "Query Failed:\n" . $conn->error . "\n";
}

$conn->close();
?>