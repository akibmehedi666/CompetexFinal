<?php
// Test script for Mentor Signup
$url = 'http://localhost/Competex/api/signup.php';

$data = [
    'name' => 'Test Mentor',
    'email' => 'mentor_test_' . rand(1000, 9999) . '@example.com',
    'password' => 'Password123!',
    'role' => 'Mentor', // Trying Capitalized as expected
    'company_name' => 'Test Corp',
    'position' => 'Senior Mentor',
    'expertise' => ['PHP', 'React'],
    'years_experience' => 5,
    'bio' => 'Test bio',
    'linkedin' => 'https://linkedin.com/in/test',
    'website' => 'https://test.com'
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
    echo "Error making request.\n";
    print_r(error_get_last());
} else {
    echo "Response:\n";
    echo $result;
}
?>