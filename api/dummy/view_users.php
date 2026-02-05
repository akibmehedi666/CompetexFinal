<?php
require 'db_connect.php';

echo "<h2>Users Table Dump (First 10 records)</h2>";

$sql = "SELECT id, name, email, password, role FROM users LIMIT 10";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    echo "<table border='1' cellspacing='0' cellpadding='5'>";
    echo "<tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Password (First 20 chars)</th>
            <th>Role</th>
          </tr>";

    while ($row = $result->fetch_assoc()) {
        $pass_display = htmlspecialchars(substr($row['password'], 0, 20)) . "...";
        // Check if looks like a hash (bcrypt starts with $2y$)
        if (strpos($row['password'], '$2y$') !== 0) {
            $pass_display .= " <br><strong style='color:red'>(LIKELY PLAIN TEXT)</strong>";
        } else {
            $pass_display .= " <br><strong style='color:green'>(HASHED)</strong>";
        }

        echo "<tr>";
        echo "<td>" . $row['id'] . "</td>";
        echo "<td>" . $row['name'] . "</td>";
        echo "<td>" . $row['email'] . "</td>";
        echo "<td>" . $pass_display . "</td>";
        echo "<td>" . $row['role'] . "</td>";
        echo "</tr>";
    }
    echo "</table>";
} else {
    echo "0 results in users table";
}
?>