<?php
header("Content-Type: text/plain");
include_once 'db_connect.php';

$sql = "CREATE TABLE IF NOT EXISTS `team_requests` (
  `id` char(36) NOT NULL,
  `team_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `status` enum('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `team_id` (`team_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `team_requests_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `team_requests_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci";

if ($conn->query($sql) === TRUE) {
    echo "Table team_requests created successfully";
} else {
    echo "Error creating table: " . $conn->error;
}

$conn->close();
?>