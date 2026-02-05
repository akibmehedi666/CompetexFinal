<?php
// Test Script for Participant Signup

$url = 'http://localhost/Competex/api/signup.php';

$email = "test_participant_" . rand(1000, 9999) . "@example.com";
$data = [
    'name' => 'Test Participant',
    'email' => $email,
    'password' => 'Password123!',
    'role' => 'participant',
    'university' => 'Test University',
    'skills' => ['PHP', 'React', 'SQL'],
    'github' => 'https://github.com/testuser'
];

$options = [
    'http' => [
        'header' => "Content-type: application/json\r\n",
        'method' => 'POST',
        'content' => json_encode($data),
    ],
];

$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);

echo "Request Data: " . json_encode($data) . "\n\n";
echo "Response: " . $result . "\n\n";

if ($result === FALSE) {
    echo "Error sending request.";
}
?>