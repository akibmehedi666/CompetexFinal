<?php
require 'db_connect.php';

echo json_encode(["status" => "success", "message" => "Database connection successful"]);

$conn->close();
?>
