<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

$if_no_db = function() use ($db): void {
    if (!$db) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database connection failed."]);
        exit;
    }
};

$if_no_db();

// Expects schema to be provisioned from `competex_db.sql` (no table creation at runtime).

$search = isset($_GET['q']) ? $_GET['q'] : "";
$team_id = isset($_GET['team_id']) ? $_GET['team_id'] : null;
$exclude_user_id = isset($_GET['exclude_user_id']) ? $_GET['exclude_user_id'] : null;

// Search participants who are not in the team already
$query = "SELECT u.id, u.name, u.email, u.avatar, p.skills 
          FROM users u
          JOIN participant_profiles p ON u.id = p.user_id
          WHERE u.role = 'Participant' 
          AND (u.name LIKE :search OR u.email LIKE :search)
          LIMIT 10";

// Note: Improved query to exclude existing members if team_id is provided
if ($team_id) {
    $query = "SELECT u.id, u.name, u.email, u.avatar, p.skills 
              FROM users u
              JOIN participant_profiles p ON u.id = p.user_id
              WHERE u.role = 'Participant' 
              AND (u.name LIKE :search OR u.email LIKE :search)
              AND u.id NOT IN (
                  SELECT user_id FROM team_members WHERE team_id = :team_id_members
              )
              AND u.id NOT IN (
                  SELECT receiver_id FROM team_invitations WHERE team_id = :team_id_invites AND status = 'pending'
              )
              LIMIT 10";
}

$filters = [];
if ($exclude_user_id) {
    $filters[] = "u.id != :exclude_user_id";
}
if (!empty($filters)) {
    $query = str_replace("LIMIT 10", "AND " . implode(" AND ", $filters) . " LIMIT 10", $query);
}

$stmt = $db->prepare($query);
$search_term = "%{$search}%";
$stmt->bindParam(":search", $search_term);

if ($team_id) {
    $stmt->bindParam(":team_id_members", $team_id);
    $stmt->bindParam(":team_id_invites", $team_id);
}

if ($exclude_user_id) {
    $stmt->bindParam(":exclude_user_id", $exclude_user_id);
}

$stmt->execute();

$users = [];
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){
    $users[] = $row;
}

echo json_encode(["status" => "success", "data" => $users]);
?>
