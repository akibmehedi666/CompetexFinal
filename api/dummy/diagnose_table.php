<?php
require 'db_connect.php';

$result = $conn->query("DESCRIBE mentor_profiles");
if ($result) {
    echo "Table 'mentor_profiles' columns:<br>";
    while ($row = $result->fetch_assoc()) {
        echo $row['Field'] . " - " . $row['Type'] . "<br>";
    }
} else {
    echo "Error describing table: " . $conn->error;
}
$conn->close();
?>