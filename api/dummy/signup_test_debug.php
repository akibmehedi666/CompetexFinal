<?php
require 'db_connect.php';

// Mock Input Data for Mentor
$mockData = [
    'name' => 'Debug Mentor',
    'email' => 'debug_mentor_' . time() . '@example.com',
    'password' => 'Debug123!',
    'role' => 'Mentor',
    'company_name' => 'Debug Corp',
    'position' => 'Senior Debugger',
    'expertise' => ['Debugging', 'PHP'],
    'years_experience' => 99,
    'bio' => 'I am debugging this.',
    'linkedin' => 'https://linkedin.com/debug',
    'website' => 'https://debug.com'
];

// $data = json_decode(file_get_contents("php://input"), true);
$data = $mockData; // Direct assignment for testing

if (!$data) {
    echo json_encode(["status" => "error", "message" => "Invalid input"]);
    exit;
}

// Basic Validation
if (empty($data['email']) || empty($data['password']) || empty($data['role']) || empty($data['name'])) {
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    exit;
}

$email = $conn->real_escape_string($data['email']);
$password = password_hash($data['password'], PASSWORD_DEFAULT);
$role = $conn->real_escape_string($data['role']);
$name = $conn->real_escape_string($data['name']);
$university = isset($data['university']) ? $conn->real_escape_string($data['university']) : null;
$github = isset($data['github']) ? $conn->real_escape_string($data['github']) : null;
// Handle skills as JSON
$skills = isset($data['skills']) ? json_encode($data['skills']) : json_encode([]);

// Generate UUID
$id = sprintf(
    '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
    mt_rand(0, 0xffff),
    mt_rand(0, 0xffff),
    mt_rand(0, 0xffff),
    mt_rand(0, 0x0fff) | 0x4000,
    mt_rand(0, 0x3fff) | 0x8000,
    mt_rand(0, 0xffff),
    mt_rand(0, 0xffff),
    mt_rand(0, 0xffff)
);

// Check if email exists
$checkSql = "SELECT id FROM users WHERE email = '$email'";
$result = $conn->query($checkSql);
if ($result->num_rows > 0) {
    echo json_encode(["status" => "error", "message" => "Email already registered"]);
    exit;
}

// Insert User
$sql = "INSERT INTO users (id, name, email, password, role, university, skills, github) VALUES ('$id', '$name', '$email', '$password', '$role', '$university', '$skills', '$github')";

if ($conn->query($sql) === TRUE) {

    // Handle Sponsor Profile Creation
    if ($role === 'Sponsor') {
        // ... (Sponsor logic)
    }

    // For Recruiter, add to recruiter_profiles
    if ($role === 'Recruiter') {
        // ... (Recruiter logic)
    }

    // For Mentor, add to mentor_profiles
    if ($role === 'Mentor') {
        $company_name = $conn->real_escape_string($data['company_name'] ?? '');
        $position = $conn->real_escape_string($data['position'] ?? '');

        $expertiseRaw = $data['expertise'] ?? [];
        $expertise = json_encode($expertiseRaw);

        $years_experience = isset($data['years_experience']) ? (int) $data['years_experience'] : 0;
        $bio = $conn->real_escape_string($data['bio'] ?? '');
        $linkedin = $conn->real_escape_string($data['linkedin'] ?? '');
        $website = $conn->real_escape_string($data['website'] ?? '');

        $mentor_sql = "INSERT INTO mentor_profiles (id, user_id, company_name, position, expertise, years_experience, bio, linkedin, website) VALUES (UUID(), '$id', '$company_name', '$position', '$expertise', $years_experience, '$bio', '$linkedin', '$website')";

        echo "Executing SQL: " . $mentor_sql . "\n";
        try {
            if (!$conn->query($mentor_sql)) {
                echo "Mentor Insert Error: " . $conn->error . "\n";
                error_log("Mentor Profile Insert Failed: " . $conn->error);
            } else {
                echo "Mentor Insert Success!\n";
            }
        } catch (Throwable $e) {
            echo "Caught Exception: " . $e->getMessage() . "\n";
            echo "Trace: " . $e->getTraceAsString() . "\n";
        }
    }

    echo json_encode([
        "status" => "success",
        "message" => "User registered successfully",
        "user" => [
            "id" => $id,
            "name" => $name,
            "email" => $email,
            "role" => $role
        ]
    ]);
} else {
    echo json_encode(["status" => "error", "message" => "Error: " . $conn->error]);
}

$conn->close();
?>