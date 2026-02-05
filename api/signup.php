<?php
require 'db_connect.php';

// Get JSON input
$data = json_decode(file_get_contents("php://input"), true);

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
$skills = $conn->real_escape_string($skills); // Escape JSON string

// Generate UUID for User
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
// Insert User (Core fields only)
// Note: We are no longer inserting university, skills, github into the users table directly.
// Ensure your users table allows these to be NULL or update the schema to remove them if desired.
$sql = "INSERT INTO users (id, name, email, password, role) VALUES ('$id', '$name', '$email', '$password', '$role')";

if ($conn->query($sql) === TRUE) {

    // Handle Sponsor Profile Creation
    if ($role === 'Sponsor') {
        $company_name = $conn->real_escape_string($data['company_name'] ?? '');
        $description = $conn->real_escape_string($data['bio'] ?? '');
        $website = $conn->real_escape_string($data['website'] ?? '');
        $sponsor_sql = "INSERT INTO sponsor_profiles (id, user_id, company_name, description, website) VALUES (UUID(), '$id', '$company_name', '$description', '$website')";
        $conn->query($sponsor_sql);
    }

    // For Recruiter, add to recruiter_profiles
    if ($role === 'Recruiter') {
        $company_name = $conn->real_escape_string($data['company_name'] ?? '');
        $position = $conn->real_escape_string($data['position'] ?? '');
        $website = $conn->real_escape_string($data['website'] ?? '');
        $linkedin = $conn->real_escape_string($data['linkedin'] ?? '');

        $recruiter_sql = "INSERT INTO recruiter_profiles (id, user_id, company_name, position, website, linkedin) VALUES (UUID(), '$id', '$company_name', '$position', '$website', '$linkedin')";
        if (!$conn->query($recruiter_sql)) {
            error_log("Recruiter Profile Insert Failed: " . $conn->error);
        }
    }

    // For Participant, add to participant_profiles
    if ($role === 'Participant' || $role === 'participant') {
        $university = isset($data['university']) ? $conn->real_escape_string($data['university']) : null;
        $github = isset($data['github']) ? $conn->real_escape_string($data['github']) : null;
        $skills = isset($data['skills']) ? json_encode($data['skills']) : json_encode([]);
        $skills = $conn->real_escape_string($skills);

        $participant_sql = "INSERT INTO participant_profiles (id, user_id, university, skills, github, name) VALUES (UUID(), '$id', '$university', '$skills', '$github', '$name')";

        if (!$conn->query($participant_sql)) {
            error_log("Participant Profile Insert Failed: " . $conn->error);
            file_put_contents('debug_log.txt', "Participant Insert Failed: " . $conn->error . "\n", FILE_APPEND);
        }
    }

    // For Mentor, add to mentor_profiles
    if ($role === 'Mentor') {
        // Generate Mentor UUID
        $mentorId = sprintf(
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

        $company_name = $conn->real_escape_string($data['company_name'] ?? '');
        $position = $conn->real_escape_string($data['position'] ?? '');

        $expertiseRaw = $data['expertise'] ?? [];
        $expertise = json_encode($expertiseRaw);
        $expertise = $conn->real_escape_string($expertise);

        $years_experience = isset($data['years_experience']) ? (int) $data['years_experience'] : 0;
        $bio = $conn->real_escape_string($data['bio'] ?? '');
        $linkedin = $conn->real_escape_string($data['linkedin'] ?? '');
        $website = $conn->real_escape_string($data['website'] ?? '');

        // Use PHP ID instead of UUID() function to be safe
        $mentor_name = $conn->real_escape_string($name);
        $mentor_sql = "INSERT INTO mentor_profiles (id, user_id, name, company_name, position, expertise, years_experience, bio, linkedin, website) VALUES ('$mentorId', '$id', '$mentor_name', '$company_name', '$position', '$expertise', $years_experience, '$bio', '$linkedin', '$website')";

        file_put_contents('debug_log.txt', "Attempting Mentor Insert: $mentor_sql\n", FILE_APPEND);

        try {
            if (!$conn->query($mentor_sql)) {
                $error_msg = "Mentor Profile Insert Failed: " . $conn->error;
                error_log($error_msg);
                file_put_contents('debug_log.txt', "ERROR: $error_msg\n", FILE_APPEND);
            } else {
                file_put_contents('debug_log.txt', "SUCCESS: Mentor profile inserted.\n", FILE_APPEND);
            }
        } catch (Exception $e) {
            file_put_contents('debug_log.txt', "EXCEPTION: " . $e->getMessage() . "\n", FILE_APPEND);
        } catch (Throwable $t) {
            file_put_contents('debug_log.txt', "FATAL ERROR: " . $t->getMessage() . "\n", FILE_APPEND);
        }
    } else {
        file_put_contents('debug_log.txt', "Skipping Mentor Insert. Role is: $role\n", FILE_APPEND);
    }

    // For Organizer, add to organizer_profiles
    if ($role === 'Organizer' || $role === 'organizer') {
        $organization_name = $conn->real_escape_string($data['organization_name'] ?? '');
        $website = $conn->real_escape_string($data['website'] ?? '');
        $is_institution = !empty($data['is_institution']) ? 1 : 0;

        $organizer_sql = "INSERT INTO organizer_profiles (id, user_id, organization_name, website, is_institution) VALUES (UUID(), '$id', '$organization_name', '$website', $is_institution)";

        if (!$conn->query($organizer_sql)) {
            error_log("Organizer Profile Insert Failed: " . $conn->error);
            file_put_contents('debug_log.txt', "Organizer Insert Failed: " . $conn->error . "\n", FILE_APPEND);
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