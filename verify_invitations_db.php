<?php
// Simple script to check if tables exist
include_once 'api/config/database.php';

// Fallback logic for DB connection if include fails (same as setup)
if (!class_exists('Database')) {
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
            }catch(PDOException $exception){ echo "Connection error: " . $exception->getMessage(); }
            return $this->conn;
        }
    }
}

$database = new Database();
$db = $database->getConnection();

if(!$db) {
    echo "Failed to connect to database.\n";
    exit;
}

$tables = ['team_invitations', 'notifications'];
foreach ($tables as $table) {
    try {
        $query = "SHOW TABLES LIKE '$table'";
        $stmt = $db->query($query);
        if ($stmt->rowCount() > 0) {
            echo "Table '$table': EXISTS\n";
        } else {
            echo "Table '$table': MISSING\n";
        }
    } catch (Exception $e) {
        echo "Error checking '$table': " . $e->getMessage() . "\n";
    }
}
?>
