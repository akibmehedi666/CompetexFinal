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

// Expects schema to be provisioned from competex_db.sql (no table creation at runtime).

$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : die();

$query = "SELECT 
            i.id as invitation_id, 
            i.status, 
            t.name as team_name, 
            t.id as team_id,
            e.title as event_title,
            u.name as sender_name
          FROM team_invitations i
          JOIN teams t ON i.team_id = t.id
          LEFT JOIN events e ON t.competition_id = e.id
          JOIN users u ON i.sender_id = u.id
          WHERE i.receiver_id = :user_id AND i.status = 'pending'
          ORDER BY i.created_at DESC";

$stmt = $db->prepare($query);
$stmt->bindParam(":user_id", $user_id);
$stmt->execute();

$invites = [];
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){
    $invites[] = $row;
}

echo json_encode(["status" => "success", "data" => $invites]);
?>
