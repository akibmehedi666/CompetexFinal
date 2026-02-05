<?php
require 'db_connect.php';

// Enable error logging, disable display errors
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', 'debug_log.txt');
header('Content-Type: application/json');

function logDebug($message)
{
    file_put_contents('debug_log.txt', date('[Y-m-d H:i:s] ') . $message . PHP_EOL, FILE_APPEND);
}

// Get JSON input
$rawInput = file_get_contents("php://input");
logDebug("Received Input: " . $rawInput);

$data = json_decode($rawInput, true);

if (!$data) {
    logDebug("Error: Invalid JSON input");
    echo json_encode(["status" => "error", "message" => "Invalid input"]);
    exit;
}

// Check if user ID is provided
if (empty($data['id'])) {
    logDebug("Error: User ID missing");
    echo json_encode(["status" => "error", "message" => "User ID is required"]);
    exit;
}

$id = $conn->real_escape_string($data['id']);

// Check if user exists first
$checkSql = "SELECT id, role FROM users WHERE id = '$id'";
$result = $conn->query($checkSql);
if ($result->num_rows === 0) {
    logDebug("Error: User not found for ID: $id");
    echo json_encode(["status" => "error", "message" => "User not found"]);
    exit;
}
$user = $result->fetch_assoc();
$role = $user['role'];
$roleNormalized = strtolower(trim($role));

// Fields allowed to be updated
$allowed_fields = [
    'name',
    'university',
    'skills',
    'avatar',
    'bio',
    'github',
    'linkedin',
    'portfolio',
    'profile_visibility',
    'verified',
    'department',
    'location',
    'role' // Added role just in case
];

$updates = [];
foreach ($allowed_fields as $field) {
    // strict check for null is not needed, but we check if key exists
    if (array_key_exists($field, $data)) {
        $value = $data[$field];

        // Handle JSON fields (skills)
        if ($field === 'skills' && is_array($value)) {
            $value = json_encode($value);
        }

        $escaped_value = $conn->real_escape_string($value);
        $updates[] = "$field = '$escaped_value'";
    }
}

if (empty($updates)) {
    logDebug("Error: No fields to update. Data keys received: " . implode(", ", array_keys($data)));
    echo json_encode(["status" => "error", "message" => "No fields to update"]);
    exit;
}

$sql = "UPDATE users SET " . implode(", ", $updates) . " WHERE id = '$id'";
logDebug("Executing SQL: " . $sql);

if ($conn->query($sql) === TRUE) {
    // Fetch updated user data to return
    $fetchSql = "SELECT * FROM users WHERE id = '$id'"; // Fetch all
    $updatedUserResult = $conn->query($fetchSql);
    $updatedUser = $updatedUserResult->fetch_assoc();

    // Decode JSON fields
    if (isset($updatedUser['skills']) && is_string($updatedUser['skills'])) {
        $updatedUser['skills'] = json_decode($updatedUser['skills']);
    }

    // Update Sponsor Profile if applicable
    $sponsor_fields = [
        'companyName' => 'company_name',
        'industry' => 'industry',
        'description' => 'description',
        'website' => 'website',
        'sponsorshipCategories' => 'sponsorship_categories'
    ];

    $sponsor_updates = [];
    foreach ($sponsor_fields as $key => $column) {
        if (array_key_exists($key, $data)) {
            $value = $data[$key];
            if ($column === 'sponsorship_categories' && is_array($value)) {
                $value = json_encode($value);
            }
            $escaped_value = $conn->real_escape_string($value);
            $sponsor_updates[] = "$column = '$escaped_value'";
        }
    }

    if (!empty($sponsor_updates)) {
        $checkSponsor = "SELECT id FROM sponsor_profiles WHERE user_id = '$id'";
        if ($conn->query($checkSponsor)->num_rows > 0) {
            $sponsorSql = "UPDATE sponsor_profiles SET " . implode(", ", $sponsor_updates) . " WHERE user_id = '$id'";
            if (!$conn->query($sponsorSql)) {
                logDebug("Sponsor Update Error: " . $conn->error);
            }
        }
    }

    // Update Recruiter Profile if applicable
    $recruiter_fields = [
        'companyName' => 'company_name',
        'position' => 'position',
        'department' => 'department',
        'website' => 'website',
        'linkedin' => 'linkedin'
    ];

    $recruiter_updates = [];
    foreach ($recruiter_fields as $key => $column) {
        if (array_key_exists($key, $data)) {
            $value = $data[$key];
            $escaped_value = $conn->real_escape_string($value);
            $recruiter_updates[] = "$column = '$escaped_value'";
        }
    }

    if (!empty($recruiter_updates)) {
        $checkRecruiter = "SELECT id FROM recruiter_profiles WHERE user_id = '$id'";
        if ($conn->query($checkRecruiter)->num_rows > 0) {
            $recruiterSql = "UPDATE recruiter_profiles SET " . implode(", ", $recruiter_updates) . " WHERE user_id = '$id'";
            if (!$conn->query($recruiterSql)) {
                logDebug("Recruiter Update Error: " . $conn->error);
            }
        }
    }

    // Update Mentor Profile if applicable
    $mentor_fields = [
        'name' => 'name',
        'mentorCompany' => 'company_name',
        'mentorPosition' => 'position',
        'expertise' => 'expertise',
        'yearsExperience' => 'years_experience',
        'mentorBio' => 'bio',
        'mentorLinkedin' => 'linkedin',
        'mentorWebsite' => 'website'
    ];

    $mentor_updates = [];
    foreach ($mentor_fields as $key => $column) {
        if (array_key_exists($key, $data)) {
            $value = $data[$key];
            if ($column === 'expertise' && is_array($value)) {
                $value = json_encode($value);
            }
            $escaped_value = $conn->real_escape_string($value);
            $mentor_updates[] = "$column = '$escaped_value'";
        }
    }

    if (!empty($mentor_updates)) {
        $checkMentor = "SELECT id FROM mentor_profiles WHERE user_id = '$id'";
        if ($conn->query($checkMentor)->num_rows > 0) {
            $mentorSql = "UPDATE mentor_profiles SET " . implode(", ", $mentor_updates) . " WHERE user_id = '$id'";
            if (!$conn->query($mentorSql)) {
                logDebug("Mentor Update Error: " . $conn->error);
            }
        }
    }

    // Update Participant Profile if applicable
    if ($roleNormalized === 'participant') {
        $participant_fields = [
            'name',
            'university',
            'skills',
            'avatar',
            'bio',
            'github',
            'linkedin',
            'portfolio',
            'profile_visibility',
            'verified',
            'department',
            'location'
        ];

        $participant_updates = [];
        $participant_insert_columns = [];
        $participant_insert_values = [];
        foreach ($participant_fields as $field) {
            if (array_key_exists($field, $data)) {
                $value = $data[$field];
                if ($field === 'skills' && is_array($value)) {
                    $value = json_encode($value);
                }
                $escaped_value = $conn->real_escape_string($value);
                $participant_updates[] = "$field = '$escaped_value'";
                $participant_insert_columns[] = $field;
                $participant_insert_values[] = "'$escaped_value'";
            }
        }

        if (!empty($participant_updates)) {
            $checkParticipant = "SELECT id FROM participant_profiles WHERE user_id = '$id'";
            $participantResult = $conn->query($checkParticipant);
            if ($participantResult && $participantResult->num_rows > 0) {
                $participantSql = "UPDATE participant_profiles SET " . implode(", ", $participant_updates) . " WHERE user_id = '$id'";
                if (!$conn->query($participantSql)) {
                    logDebug("Participant Update Error: " . $conn->error);
                }
            } else {
                $insertColumns = ["id", "user_id"];
                $insertValues = ["UUID()", "'$id'"];
                if (!empty($participant_insert_columns)) {
                    $insertColumns = array_merge($insertColumns, $participant_insert_columns);
                    $insertValues = array_merge($insertValues, $participant_insert_values);
                }
                $participantSql = "INSERT INTO participant_profiles (" . implode(", ", $insertColumns) . ") VALUES (" . implode(", ", $insertValues) . ")";
                if (!$conn->query($participantSql)) {
                    logDebug("Participant Insert Error: " . $conn->error);
                }
            }
        }
    }

    // Remove password
    unset($updatedUser['password']);

    // Fetch refreshed sponsor data to merge
    $spSql = "SELECT company_name, industry, description, website, sponsorship_categories FROM sponsor_profiles WHERE user_id = '$id'";
    $spResult = $conn->query($spSql);
    if ($spResult->num_rows > 0) {
        $spData = $spResult->fetch_assoc();
        if (isset($spData['sponsorship_categories']) && is_string($spData['sponsorship_categories'])) {
            $spData['sponsorship_categories'] = json_decode($spData['sponsorship_categories']);
        }
        $updatedUser = array_merge($updatedUser, $spData);
    }

    // Fetch refreshed recruiter data to merge
    $rpSql = "SELECT company_name as recruiter_company, position as recruiter_position, department as recruiter_department, website as recruiter_website, linkedin as recruiter_linkedin FROM recruiter_profiles WHERE user_id = '$id'";
    $rpResult = $conn->query($rpSql);
    if ($rpResult->num_rows > 0) {
        $rpData = $rpResult->fetch_assoc();
        $updatedUser = array_merge($updatedUser, $rpData);
    }

    // Fetch refreshed mentor data to merge
    $mpSql = "SELECT name as mentor_name, company_name as mentor_company, position as mentor_position, expertise, years_experience, bio as mentor_bio, linkedin as mentor_linkedin, website as mentor_website FROM mentor_profiles WHERE user_id = '$id'";
    $mpResult = $conn->query($mpSql);
    if ($mpResult->num_rows > 0) {
        $mpData = $mpResult->fetch_assoc();
        $updatedUser = array_merge($updatedUser, $mpData);
    }

    logDebug("Update Success");
    echo json_encode([
        "status" => "success",
        "message" => "Profile updated successfully",
        "user" => $updatedUser
    ]);
} else {
    logDebug("SQL Error: " . $conn->error);
    echo json_encode(["status" => "error", "message" => "Error updating profile: " . $conn->error]);
}

$conn->close();
?>
