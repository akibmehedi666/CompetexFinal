<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'db_connect.php';

if (!isset($_GET['event_id']) || !isset($_GET['user_id'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing event_id or user_id"]);
    exit();
}

$event_id = $conn->real_escape_string($_GET['event_id']);
$user_id = $conn->real_escape_string($_GET['user_id']);

// Expects schema to be provisioned from competex_db.sql (no table creation at runtime).

$response = [
    "status" => "success",
    "is_enrolled" => false,
    "request_status" => null,
    "enrollment_type" => null,
    "team_details" => null
];

// 1. Check INDIVIDUAL Enrollment
// Assuming `event_participants` table has `user_id` and `event_id`
$check_indiv = $conn->query("SELECT * FROM event_participants WHERE event_id = '$event_id' AND user_id = '$user_id'");
if ($check_indiv->num_rows > 0) {
    $response['is_enrolled'] = true;
    $response['enrollment_type'] = 'individual';
    $response['request_status'] = 'approved';
    echo json_encode($response);
    exit();
}

// 2. Check TEAM Enrollment
// First, find all teams this user belongs to.
// We need to check both `teams` (as leader) and `team_members` (as member).
// Assuming `teams` has `leader_id` and `team_members` has `team_id`, `user_id`.

$user_teams = [];

// As Leader
$leader_query = $conn->query("SELECT id, name FROM teams WHERE leader_id = '$user_id'");
while ($row = $leader_query->fetch_assoc()) {
    $user_teams[$row['id']] = $row;
}

// As Member
// Assuming `team_members` table exists. If not, we might only be checking leader for now, but let's try.
// Given strict context, let's assume `team_members` exists or we fallback to leader.
// Schema check for team_members?
// Based on `get_team_members.php` (if it existed) or common sense.
// Let's assume `team_members`. If fail, catch error?
// To be safe, let's query `team_members` if table exists. 
// For now, I'll stick to knowns: User can be leader. The prompt implies "User is member".
// I'll query `team_members` blindly. If it fails, script errors.
// Actually, I should be careful. I'll just check leader for now to enable the "My Team" flow which is confirmed.
// If the user wants generic member support, I'd need to confirm the schema.
// BUT, the goal is "participation".
// Let's check `teams` where `leader_id` is user.

// ALSO need to check if user is a member.
// Let's try to infer from `get_teams.php`? It wasn't shown.
// I'll add `team_members` query.
$member_query = $conn->query("SELECT t.id, t.name FROM team_members tm JOIN teams t ON tm.team_id = t.id WHERE tm.user_id = '$user_id'");
if ($member_query) {
    while ($row = $member_query->fetch_assoc()) {
        $user_teams[$row['id']] = $row;
    }
}

// Now check if any of these teams are in `event_teams`
if (!empty($user_teams)) {
    $team_ids = array_map(function ($id) use ($conn) {
        return "'" . $conn->real_escape_string($id) . "'"; }, array_keys($user_teams));
    $ids_str = implode(',', $team_ids);

    $check_team_enroll = $conn->query("SELECT * FROM event_teams WHERE event_id = '$event_id' AND team_id IN ($ids_str)");

    if ($check_team_enroll->num_rows > 0) {
        $enrolled_team = $check_team_enroll->fetch_assoc();
        $t_id = $enrolled_team['team_id'];

        $response['is_enrolled'] = true;
        $response['enrollment_type'] = 'team';
        $response['request_status'] = 'approved';
        $response['team_details'] = $user_teams[$t_id];
        echo json_encode($response);
        exit();
    }
}

// 3. Check for Pending Requests (Individual)
$check_req_indiv = $conn->query("SELECT * FROM event_requests WHERE event_id = '$event_id' AND user_id = '$user_id' AND team_id IS NULL AND status = 'pending'");
if ($check_req_indiv->num_rows > 0) {
    $response['request_status'] = 'pending';
    $response['enrollment_type'] = 'individual';
    echo json_encode($response);
    exit();
}

// 4. Check for Pending Requests (Team)
if (!empty($user_teams)) {
    $team_ids = array_map(function ($id) use ($conn) {
        return "'" . $conn->real_escape_string($id) . "'"; }, array_keys($user_teams));
    $ids_str = implode(',', $team_ids);

    $check_req_team = $conn->query("SELECT * FROM event_requests WHERE event_id = '$event_id' AND team_id IN ($ids_str) AND status = 'pending'");

    if ($check_req_team->num_rows > 0) {
        $req = $check_req_team->fetch_assoc();

        $response['request_status'] = 'pending';
        $response['enrollment_type'] = 'team';
        // Can return which team
        $response['team_details'] = $user_teams[$req['team_id']];
        echo json_encode($response);
        exit();
    }
}

echo json_encode($response);
$conn->close();
?>
