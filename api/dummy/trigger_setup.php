<?php
$url = 'http://localhost/Competex/api/setup_mentor_table.php';
echo "Triggering: $url\n";
$result = file_get_contents($url);
echo "Result: " . $result . "\n";
?>