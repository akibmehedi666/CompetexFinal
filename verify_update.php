<?php
require 'api/db_connect.php';
$sql = "SELECT id, email, bio FROM users WHERE bio = 'Updated Bio from PowerShell'";
$res = $conn->query($sql);

if ($res && $res->num_rows > 0) {
    echo "VERIFICATION SUCCESS: Found " . $res->num_rows . " user(s) with updated bio.\n";
    while ($row = $res->fetch_assoc()) {
        print_r($row);
    }
} else {
    echo "VERIFICATION FAILED: User not found.\n";
}
?>