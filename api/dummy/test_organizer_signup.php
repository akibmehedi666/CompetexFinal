<?php
// URL of the signup API
$url = 'http://localhost/Competex/api/signup.php';

// Data to send for Organizer Signup
$data = [
    'name' => 'Organizer Test User',
    'email' => 'organizer_test_' . rand(1000, 9999) . '@example.com',
    'password' => 'password123',
    'role' => 'organizer',
    'organization_name' => 'Tech Events Inc',
    'website' => 'https://techevents.com',
    'is_institution' => true
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

if ($result === FALSE) {
    echo "Error sending request.\n";
} else {
    echo "Response received:\n";
    echo $result;
}
?>