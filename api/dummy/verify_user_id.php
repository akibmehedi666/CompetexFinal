<?php
header("Content-Type: text/plain");
include_once 'db_connect.php';

$user_id = "6635c06e-22c9-4807-a99e-a3bf3d730a87"; // Partha Podder
echo "Checking User ID: [$user_id]\n";

$sql = "SELECT * FROM users WHERE id = '$user_id'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    echo "✅ User found!\n";
    $row = $result->fetch_assoc();
    print_r($row);
} else {
    echo "❌ User NOT found.\n";

    // List all IDs to see what matches
    echo "\nListing first 5 IDs in DB:\n";
    $list_res = $conn->query("SELECT id FROM users LIMIT 5");
    while ($r = $list_res->fetch_assoc()) {
        echo "[" . $r['id'] . "]\n";
    }
}
$conn->close();
?>