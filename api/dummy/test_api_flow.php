<?php
// Try 127.0.0.1 instead of localhost
$baseUrl = 'http://127.0.0.1:3308/CompetexPHP/Competex/api';

echo "1. Checking Server Health...\n";
$healthUrl = "$baseUrl/verify_port_3308.php";
$health = @file_get_contents($healthUrl);

if ($health === false) {
    echo "❌ Server unreachable at $healthUrl\n";
    // Try to get error info
    $error = error_get_last();
    echo "Error: " . $error['message'] . "\n";
    exit(1);
} else {
    echo "✅ Server reachable! Response: $health\n\n";
}

echo "2. Testing Create Event...\n";
$createUrl = "$baseUrl/create_event.php";

$data = [
    "title" => "API Test Event",
    "description" => "Test description",
    "category" => "Hackathon",
    "organizerId" => "u1",
    "mode" => "Online",
    "startDate" => "2026-01-01 10:00:00", 
    "date" => "Jan 1",
    "maxParticipants" => 10,
    "image" => "db_test.jpg"
];

$options = [
    'http' => [
        'header'  => "Content-type: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode($data),
        'ignore_errors' => true
    ]
];
$context  = stream_context_create($options);
$response = file_get_contents($createUrl, false, $context);

// Check if we got a response (even a 404/500 is a response with ignore_errors)
if ($response !== false) {
    // Check headers for response code if needed, but response body usually helps
    echo "Create Response: " . $response . "\n";
    $json = json_decode($response, true);
    if ($json && isset($json['status']) && $json['status'] == 'success') {
        echo "✅ Creation Success!\n";
    } else {
        echo "❌ Creation Failed in logic.\n";
    }
} else {
    echo "❌ Creation Request Failed to Connect.\n";
}
?>
