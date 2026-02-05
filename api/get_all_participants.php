<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db_connect.php';

$team_id = isset($_GET['team_id']) ? trim($_GET['team_id']) : '';
$exclude_user_id = isset($_GET['exclude_user_id']) ? trim($_GET['exclude_user_id']) : '';

$hasTeamInvitations = false;
$tableCheck = $conn->query("SHOW TABLES LIKE 'team_invitations'");
if ($tableCheck && $tableCheck->num_rows > 0) {
    $hasTeamInvitations = true;
}

// SQL to fetch participants and their profiles
// REMOVED event_participants join as the table might not exist yet
$sql = "SELECT 
            u.id, 
            u.email, 
            u.role, 
            u.avatar as user_avatar,
            u.name as user_name,
            u.verified as user_verified,
            pp.name as profile_name, 
            pp.university, 
            pp.location, 
            pp.skills, 
            pp.avatar as profile_avatar, 
            pp.verified as profile_verified
        FROM users u
        LEFT JOIN participant_profiles pp ON u.id = pp.user_id
        WHERE u.role = 'Participant'";

$types = "";
$params = [];

if ($exclude_user_id !== '') {
    $sql .= " AND u.id <> ?";
    $types .= "s";
    $params[] = $exclude_user_id;
}

if ($team_id !== '') {
    $sql .= " AND u.id NOT IN (SELECT user_id FROM team_members WHERE team_id = ?)";
    $types .= "s";
    $params[] = $team_id;

    if ($hasTeamInvitations) {
        $sql .= " AND u.id NOT IN (SELECT receiver_id FROM team_invitations WHERE team_id = ? AND status = 'pending')";
        $types .= "s";
        $params[] = $team_id;
    }
}

$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database Query Failed: " . $conn->error]);
    exit();
}

if ($types !== "") {
    $bind = array_merge([$types], $params);
    $refs = [];
    foreach ($bind as $k => $v) {
        $refs[$k] = &$bind[$k];
    }
    call_user_func_array([$stmt, "bind_param"], $refs);
}

$stmt->execute();
$result = $stmt->get_result();

if (!$result) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database Query Failed: " . $conn->error]);
    exit();
}

$participants = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $id = $row['id'];

        // Determine values based on precedence (Profile > User)
        $name = !empty($row['profile_name']) ? $row['profile_name'] : $row['user_name'];
        $avatar = !empty($row['profile_avatar']) ? $row['profile_avatar'] : ($row['user_avatar'] ?? "https://api.dicebear.com/7.x/avataaars/svg?seed=" . urlencode($name));
        $verified = !empty($row['profile_verified']) ? (bool) $row['profile_verified'] : (bool) $row['user_verified'];

        $skills = [];
        if (!empty($row['skills'])) {
            $decoded = json_decode($row['skills'], true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $skills = $decoded;
            } else {
                if (is_string($row['skills']) && strpos($row['skills'], '[') === false) {
                    $skills = array_filter(array_map('trim', explode(',', $row['skills'])));
                }
            }
        }

        $competitions = [];
        // Removed competition aggregation logic for now as table is missing

        // Mock stats and details for now as they might not be in DB yet
        $stats = [
            "rank" => rand(1, 100),
            "eventsWon" => rand(0, 5),
            "wins" => rand(0, 5),
            "points" => rand(100, 5000),
            "avgScore" => rand(70, 100)
        ];

        $details = [
            "availability" => "Open to Work",
            "rate" => "$0/hr",
            "experience" => "Unknown"
        ];

        $participant = [
            "id" => $id,
            "name" => $name,
            "email" => $row['email'],
            "role" => "Participant",
            "university" => $row['university'] ?? "Global Agent",
            "location" => $row['location'] ?? "Remote",
            "skills" => $skills,
            "competitions" => $competitions,
            "avatar" => $avatar,
            "verified" => $verified,
            "stats" => $stats,
            "details" => $details
        ];

        $participants[] = $participant;
    }
}

echo json_encode($participants);

$stmt->close();
$conn->close();
?>
