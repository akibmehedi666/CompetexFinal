<?php
require 'db_connect.php';

// Check if user_id is provided
if (!isset($_GET['user_id'])) {
    echo json_encode(["status" => "error", "message" => "User ID is required"]);
    exit;
}

$user_id = $conn->real_escape_string($_GET['user_id']);

// Fetch user data
$sql = "SELECT u.id, u.email, u.role, 
        pp.name as participant_name, pp.university as participant_university, pp.skills as participant_skills, pp.avatar as participant_avatar, pp.bio as participant_bio, pp.github as participant_github, pp.linkedin as participant_linkedin, pp.portfolio as participant_portfolio, pp.profile_visibility as participant_profile_visibility, pp.verified as participant_verified, pp.department as participant_department, pp.location as participant_location,
        u.name, u.university, u.skills, u.avatar, u.bio, u.github, u.linkedin, u.portfolio, u.profile_visibility, u.verified, u.department, u.location,
        sp.company_name, sp.industry, sp.description as sponsor_bio, sp.website as sponsor_website, sp.sponsorship_categories, sp.location as sponsor_location,
        rp.company_name as recruiter_company, rp.position as recruiter_position, rp.department as recruiter_department, rp.website as recruiter_website, rp.linkedin as recruiter_linkedin,
        mp.name as mentor_name, mp.company_name as mentor_company, mp.position as mentor_position, mp.expertise, mp.years_experience, mp.bio as mentor_bio, mp.linkedin as mentor_linkedin, mp.website as mentor_website,
        op.organization_name, op.website as organizer_website, op.is_institution
        FROM users u
        LEFT JOIN participant_profiles pp ON u.id = pp.user_id
        LEFT JOIN sponsor_profiles sp ON u.id = sp.user_id
        LEFT JOIN recruiter_profiles rp ON u.id = rp.user_id
        LEFT JOIN mentor_profiles mp ON u.id = mp.user_id
        LEFT JOIN organizer_profiles op ON u.id = op.user_id
        WHERE u.id = '$user_id'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();

    // Consolidate fields for Participant
    if (strcasecmp($user['role'], 'Participant') === 0) {
        $user['name'] = $user['participant_name'] ?? $user['name'];
        $user['university'] = $user['participant_university'] ?? $user['university'];
        $user['skills'] = $user['participant_skills'] ?? $user['skills'];
        if (!empty($user['participant_avatar'])) {
            $user['avatar'] = $user['participant_avatar'];
        }
        $user['bio'] = $user['participant_bio'] ?? $user['bio'];
        $user['github'] = $user['participant_github'] ?? $user['github'];
        $user['linkedin'] = $user['participant_linkedin'] ?? $user['linkedin'];
        $user['portfolio'] = $user['participant_portfolio'] ?? $user['portfolio'];
        $user['profile_visibility'] = $user['participant_profile_visibility'] ?? $user['profile_visibility'];
        $user['verified'] = $user['participant_verified'] ?? $user['verified'];
        $user['department'] = $user['participant_department'] ?? $user['department'];
        $user['location'] = $user['participant_location'] ?? $user['location'];
    }

    // Decode JSON fields if they are strings
    if (isset($user['skills']) && is_string($user['skills'])) {
        $user['skills'] = json_decode($user['skills']);
    }

    echo json_encode([
        "status" => "success",
        "user" => $user
    ]);
} else {
    echo json_encode(["status" => "error", "message" => "User not found"]);
}

$conn->close();
?>
