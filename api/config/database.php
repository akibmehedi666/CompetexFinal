<?php
class Database {
    private string $host = "localhost";
    private string $db_name = "competex_db";
    private string $username = "root";
    private string $password = "";
    private int $port = 3306;

    public ?PDO $conn = null;

    public function getConnection(): ?PDO {
        if ($this->conn) {
            return $this->conn;
        }

        try {
            $dsn = "mysql:host={$this->host};port={$this->port};dbname={$this->db_name};charset=utf8mb4";
            $this->conn = new PDO($dsn, $this->username, $this->password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $exception) {
            $this->conn = null;
        }

        return $this->conn;
    }
}

