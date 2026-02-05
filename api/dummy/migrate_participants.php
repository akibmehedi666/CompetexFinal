<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'db_connect.php';

$response = [];

// 1. Add missing columns to participant_profiles
$alterQueries = [
    "ADD COLUMN IF NOT EXISTS bio TEXT",
    "ADD COLUMN IF NOT EXISTS avatar TEXT",
    "ADD COLUMN IF NOT EXISTS linkedin TEXT",
    "ADD COLUMN IF NOT EXISTS portfolio TEXT",
    "ADD COLUMN IF NOT EXISTS department VARCHAR(255)",
    "ADD COLUMN IF NOT EXISTS location VARCHAR(255)",
    "ADD COLUMN IF NOT EXISTS profile_visibility ENUM('public', 'recruiters-only', 'private') DEFAULT 'public'",
    "ADD COLUMN IF NOT EXISTS verified TINYINT(1) DEFAULT 0",
    "ADD COLUMN IF NOT EXISTS name VARCHAR(255)"
];

foreach ($alterQueries as $sql) {
    try {
        $conn->query("ALTER TABLE participant_profiles " . $sql);
        $response['schema_updates'][] = "Executed: $sql";
    } catch (Exception $e) {
        $response['schema_updates'][] = "Error executing $sql: " . $e->getMessage();
    }
}

// 2. Fetch all participants from users table
$sql = "SELECT * FROM users WHERE role = 'Participant'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $count = 0;
    while ($user = $result->fetch_assoc()) {
        $userId = $user['id'];

        // Prepare data from users table
        $bio = isset($user['bio']) ? $conn->real_escape_string($user['bio']) : '';
        $avatar = isset($user['avatar']) ? $conn->real_escape_string($user['avatar']) : '';
        $linkedin = isset($user['linkedin']) ? $conn->real_escape_string($user['linkedin']) : '';
        $portfolio = isset($user['portfolio']) ? $conn->real_escape_string($user['portfolio']) : '';
        $department = isset($user['department']) ? $conn->real_escape_string($user['department']) : '';
        $location = isset($user['location']) ? $conn->real_escape_string($user['location']) : '';
        $profile_visibility = isset($user['profile_visibility']) ? $conn->real_escape_string($user['profile_visibility']) : 'public';
        $verified = isset($user['verified']) ? (int) $user['verified'] : 0;
        $university = isset($user['university']) ? $conn->real_escape_string($user['university']) : '';
        $skills = isset($user['skills']) ? $conn->real_escape_string($user['skills']) : '';
        $github = isset($user['github']) ? $conn->real_escape_string($user['github']) : '';
        $name = isset($user['name']) ? $conn->real_escape_string($user['name']) : '';

        // Check if profile exists
        $checkSql = "SELECT id FROM participant_profiles WHERE user_id = '$userId'";
        $checkResult = $conn->query($checkSql);

        if ($checkResult->num_rows > 0) {
            // Update existing profile
            $updateSql = "UPDATE participant_profiles SET 
                bio = '$bio',
                avatar = '$avatar',
                linkedin = '$linkedin',
                portfolio = '$portfolio',
                department = '$department',
                location = '$location',
                profile_visibility = '$profile_visibility',
                verified = $verified,
                university = '$university',
                skills = '$skills',
                github = '$github',
                name = '$name'
                WHERE user_id = '$userId'";

            if ($conn->query($updateSql) === TRUE) {
                $response['data_migration'][] = "Updated profile for User ID: $userId";
            } else {
                $response['data_migration'][] = "Error updating profile for User ID $userId: " . $conn->error;
            }
        } else {
            // Insert new profile
            $profileId = uniqid();

            $insertSql = "INSERT INTO participant_profiles (id, user_id, university, skills, github, bio, avatar, linkedin, portfolio, department, location, profile_visibility, verified, name)
            VALUES ('$profileId', '$userId', '$university', '$skills', '$github', '$bio', '$avatar', '$linkedin', '$portfolio', '$department', '$location', '$profile_visibility', $verified, '$name')";

            if ($conn->query($insertSql) === TRUE) {
                $response['data_migration'][] = "Inserted profile for User ID: $userId";
            } else {
                $response['data_migration'][] = "Error inserting profile for User ID $userId: " . $conn->error;
            }
        }
        $count++;
    }
    $response['status'] = "Processed $count participants.";
} else {
    $response['status'] = "No participants found in users table.";
}

echo json_encode($response, JSON_PRETTY_PRINT);
?>