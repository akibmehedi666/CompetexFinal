<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'api/config/database.php';

// If config/database.php doesn't exist relative to this file, try to find it
if (!file_exists('api/config/database.php')) {
    if (file_exists('../api/config/database.php')) {
        include_once '../api/config/database.php';
    } elseif (file_exists('competex/api/config/database.php')) {
        include_once 'competex/api/config/database.php';
    } else {
        // Fallback: Try to connect with default credentials if config file missing (Development env)
        class Database {
            private $host = "localhost";
            private $db_name = "competex_db";
            private $username = "root";
            private $password = "";
            public $conn;
        
            public function getConnection(){
                $this->conn = null;
                try{
                    $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
                    $this->conn->exec("set names utf8");
                }catch(PDOException $exception){
                    echo "Connection error: " . $exception->getMessage();
                }
                return $this->conn;
            }
        }
    }
}

$database = new Database();
$db = $database->getConnection();

$tables = [];

// Team Invitations Table
$tables[] = "CREATE TABLE IF NOT EXISTS `team_invitations` (
  `id` char(36) NOT NULL,
  `team_id` char(36) NOT NULL,
  `sender_id` char(36) NOT NULL,
  `receiver_id` char(36) NOT NULL,
  `status` enum('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_receiver_status` (`receiver_id`,`status`),
  KEY `idx_team_receiver` (`team_id`,`receiver_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";

// Notifications Table
$tables[] = "CREATE TABLE IF NOT EXISTS `notifications` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `reference_id` char(36) DEFAULT NULL,
  `message` text NOT NULL,
  `type` varchar(50) DEFAULT 'system',
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_reference` (`user_id`,`reference_id`),
  KEY `idx_user_read` (`user_id`,`is_read`),
  KEY `idx_user_created` (`user_id`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";

$messages = [];

foreach ($tables as $sql) {
    try {
        $db->exec($sql);
        $messages[] = "Table created or already exists.";
    } catch (PDOException $e) {
        $messages[] = "Error creating table: " . $e->getMessage();
    }
}

echo json_encode(["status" => "success", "messages" => $messages]);
?>
