<?php
$url = 'http://localhost/Competex/api/signup.php';
$data = [
    'name' => 'Real API Test Mentor',
    'email' => 'api_test_' . time() . '@example.com',
    'password' => 'Password123!',
    'role' => 'Mentor',
    'company_name' => 'API Test Corp',
    'position' => 'API Tester',
    'expertise' => ['API', 'Testing'],
    'years_experience' => 10,
    'bio' => 'Testing via API call',
    'linkedin' => 'https://linkedin.com/api',
    'website' => 'https://apitest.com'
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

echo "API Response: " . $result . "\n";
?>