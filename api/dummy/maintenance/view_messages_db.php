<?php
// (maintenance) moved out of production API endpoints.
require 'db_connect.php';

$sql = "SELECT * FROM messages ORDER BY created_at DESC";
$result = $conn->query($sql);

echo "<h3>Messages Table Content</h3>";
if ($result->num_rows > 0) {
    echo "<table border='1'><tr><th>ID</th><th>Sender</th><th>Recipient</th><th>Content</th><th>Time</th></tr>";
    while ($row = $result->fetch_assoc()) {
        echo "<tr>";
        echo "<td>" . $row["id"] . "</td>";
        echo "<td>" . $row["sender_id"] . "</td>";
        echo "<td>" . $row["recipient_id"] . "</td>";
        echo "<td>" . htmlspecialchars($row["content"]) . "</td>";
        echo "<td>" . $row["created_at"] . "</td>";
        echo "</tr>";
    }
    echo "</table>";
} else {
    echo "No messages found in database.";
}
$conn->close();
?>
