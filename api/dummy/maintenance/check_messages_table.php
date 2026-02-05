<?php
// (maintenance) moved out of production API endpoints.
require 'db_connect.php';

$sql = "SHOW TABLES LIKE 'messages'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    echo "Table 'messages' exists.\n";
    $sql = "DESCRIBE messages";
    $result = $conn->query($sql);
    while ($row = $result->fetch_assoc()) {
        echo $row['Field'] . " - " . $row['Type'] . "\n";
    }
} else {
    echo "Table 'messages' does NOT exist.\n";
}

$conn->close();
?>
