<?php
require 'db_connect.php';

// Add sponsorship_categories column if it doesn't exist
$sql = "SHOW COLUMNS FROM sponsor_profiles LIKE 'sponsorship_categories'";
$result = $conn->query($sql);

if ($result->num_rows == 0) {
    $alterSql = "ALTER TABLE sponsor_profiles ADD COLUMN sponsorship_categories JSON";
    if ($conn->query($alterSql) === TRUE) {
        echo "Successfully added sponsorship_categories column.<br>";
    } else {
        echo "Error adding sponsorship_categories column: " . $conn->error . "<br>";
    }
} else {
    echo "sponsorship_categories column already exists.<br>";
}

// Also check for other columns just in case
$columnsToCheck = ['location', 'website', 'industry', 'description', 'company_name'];
foreach ($columnsToCheck as $col) {
    $check = $conn->query("SHOW COLUMNS FROM sponsor_profiles LIKE '$col'");
    if ($check->num_rows == 0) {
        $add = "ALTER TABLE sponsor_profiles ADD COLUMN $col TEXT"; // Default to TEXT for simplicity
        if ($conn->query($add)) {
            echo "Added $col.<br>";
        } else {
            echo "Error adding $col: " . $conn->error . "<br>";
        }
    }
}

echo "Schema check complete.";
?>