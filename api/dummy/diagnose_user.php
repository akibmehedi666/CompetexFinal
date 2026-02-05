<?php
require 'db_connect.php';
$email = 'partha666@gmail.com';
$sql = "SELECT email, role, skills FROM users WHERE email = '$email'";
$result = $conn->query($sql);
if ($result->num_rows > 0) {
    echo json_encode($result->fetch_assoc());
} else {
    echo json_encode(["error" => "User not found"]);
}
$conn->close();
?>
