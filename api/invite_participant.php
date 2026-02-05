<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once 'config/database.php';
require_once __DIR__ . '/lib/notifications.php';

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

// Expects schema to be provisioned from `competex_db.sql` (no table/column creation at runtime).

$data = json_decode(file_get_contents("php://input"));

if(
    !empty($data->team_id) &&
    !empty($data->sender_id) &&
    !empty($data->receiver_id)
){
    try {
        $db->beginTransaction();

        $sender_id = (string)$data->sender_id;
        $receiver_id = (string)$data->receiver_id;
        $team_id = (string)$data->team_id;

        // 1. Verify sender is the leader of the team
        $query = "SELECT leader_id FROM teams WHERE id = :team_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":team_id", $team_id);
        $stmt->execute();
        $team = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$team || (string)$team['leader_id'] !== $sender_id) {
            $db->rollBack();
            echo json_encode(["status" => "error", "message" => "Only the team leader can invite members."]);
            exit;
        }

        // 2. Check if already invited or member
        $check_query = "SELECT id FROM team_invitations WHERE team_id = :team_id AND receiver_id = :receiver_id AND status = 'pending'";
        $stmt = $db->prepare($check_query);
        $stmt->bindParam(":team_id", $team_id);
        $stmt->bindParam(":receiver_id", $receiver_id);
        $stmt->execute();
        if($stmt->rowCount() > 0){
             $db->rollBack();
             echo json_encode(["status" => "error", "message" => "User already invited."]);
             exit;
        }

        $check_member = "SELECT user_id FROM team_members WHERE team_id = :team_id AND user_id = :receiver_id";
        $stmt = $db->prepare($check_member);
        $stmt->bindParam(":team_id", $team_id);
        $stmt->bindParam(":receiver_id", $receiver_id);
        $stmt->execute();
        if($stmt->rowCount() > 0){
             $db->rollBack();
             echo json_encode(["status" => "error", "message" => "User is already a member."]);
             exit;
        }

        // 2b. Fetch team + sender name for a better notification message
        $meta_query = "SELECT t.name AS team_name, u.name AS sender_name
                       FROM teams t
                       JOIN users u ON u.id = :sender_id
                       WHERE t.id = :team_id";
        $stmt = $db->prepare($meta_query);
        $stmt->bindParam(":sender_id", $sender_id);
        $stmt->bindParam(":team_id", $team_id);
        $stmt->execute();
        $meta = $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
        $team_name = $meta['team_name'] ?? "a team";
        $sender_name = $meta['sender_name'] ?? "A team leader";

        // 3. Create Invitation
        $invitation_id = competex_uuidv4();
        $query = "INSERT INTO team_invitations SET id=:id, team_id=:team_id, sender_id=:sender_id, receiver_id=:receiver_id, created_at=:created_at";
        $stmt = $db->prepare($query);

        $created_at = date('Y-m-d H:i:s');

        $stmt->bindParam(":id", $invitation_id);
        $stmt->bindParam(":team_id", $team_id);
        $stmt->bindParam(":sender_id", $sender_id);
        $stmt->bindParam(":receiver_id", $receiver_id);
        $stmt->bindParam(":created_at", $created_at);

        if($stmt->execute()){
            $notif_msg = "{$sender_name} invited you to join \"{$team_name}\".";
            competex_notify_user($db, $receiver_id, "invite", $notif_msg, $invitation_id, $created_at);

            $db->commit();
            echo json_encode(["status" => "success", "message" => "Invitation sent successfully."]);
        } else {
            $db->rollBack();
            echo json_encode(["status" => "error", "message" => "Unable to send invitation."]);
        }
    } catch(PDOException $e) {
        if ($db && $db->inTransaction()) {
            $db->rollBack();
        }
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Incomplete data."]);
}
?>
