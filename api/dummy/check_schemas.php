<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "competex_db";

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die(json_encode(["error" => "Connection failed: " . $e->getMessage()]));
}

$tables = ['users', 'participant_profiles'];
$results = [];

foreach ($tables as $table) {
    try {
        $query = "DESCRIBE " . $table;
        $stmt = $conn->prepare($query);
        $stmt->execute();
        $results[$table] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        $results[$table] = "Error: " . $e->getMessage();
    }
}

$json = json_encode($results, JSON_PRETTY_PRINT);
file_put_contents('schema_dump.json', $json);
echo "Dumped schema to schema_dump.json";
?>