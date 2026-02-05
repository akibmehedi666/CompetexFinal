<?php
require_once 'db_connect.php';
header('Content-Type: application/json');

$sql = "SELECT id, name, email, role FROM users";
$result = $conn->query($sql);

$users = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }
}
echo json_encode($users);
$conn->close();
?>