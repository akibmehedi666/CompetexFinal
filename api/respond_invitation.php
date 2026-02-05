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

// Expects schema to be provisioned from `competex_db.sql` (no table creation at runtime).

$data = json_decode(file_get_contents("php://input"));

if(
    !empty($data->invitation_id) &&
    !empty($data->response) // 'accept' or 'reject'
){
    try {
        $db->beginTransaction();

        // 1. Get invitation details
        $query = "SELECT * FROM team_invitations WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":id", $data->invitation_id);
        $stmt->execute();
        $invite = $stmt->fetch(PDO::FETCH_ASSOC);

        if(!$invite){
            $db->rollBack();
            echo json_encode(["status" => "error", "message" => "Invitation not found."]);
            exit;
        }

        // Get names for consistent notifications
        $metaStmt = $db->prepare("
            SELECT
                t.name AS team_name,
                sender.name AS sender_name,
                receiver.name AS receiver_name
            FROM team_invitations ti
            JOIN teams t ON t.id = ti.team_id
            JOIN users sender ON sender.id = ti.sender_id
            JOIN users receiver ON receiver.id = ti.receiver_id
            WHERE ti.id = :invitation_id
            LIMIT 1
        ");
        $metaStmt->bindParam(":invitation_id", $data->invitation_id);
        $metaStmt->execute();
        $meta = $metaStmt->fetch(PDO::FETCH_ASSOC) ?: [];
        $team_name = $meta["team_name"] ?? "the team";
        $receiver_name = $meta["receiver_name"] ?? "A participant";

        // 2. Update status
        $status = ($data->response === 'accept') ? 'accepted' : 'rejected';
        $update_query = "UPDATE team_invitations SET status = :status WHERE id = :id";
        $stmt = $db->prepare($update_query);
        $stmt->bindParam(":status", $status);
        $stmt->bindParam(":id", $data->invitation_id);
        $stmt->execute();

        // 3. If accepted, add to team members
        if($status === 'accepted'){
            // Check if already member (double check)
            $check = "SELECT user_id FROM team_members WHERE team_id = :team_id AND user_id = :user_id";
            $stmt = $db->prepare($check);
            $stmt->bindParam(":team_id", $invite['team_id']);
            $stmt->bindParam(":user_id", $invite['receiver_id']);
            $stmt->execute();
            
            if($stmt->rowCount() == 0){
                $add_query = "INSERT INTO team_members (team_id, user_id) VALUES (:team_id, :user_id)";
                $stmt = $db->prepare($add_query);
                $stmt->bindParam(":team_id", $invite['team_id']);
                $stmt->bindParam(":user_id", $invite['receiver_id']);
                $stmt->execute();
            }
        }

        // Convert receiver's "invite" notification into a read-only update (prevents showing action buttons again)
        $receiverMsg = $status === 'accepted'
            ? "You accepted the invitation to join \"{$team_name}\"."
            : "You rejected the invitation to join \"{$team_name}\".";
        $updNotif = $db->prepare("
            UPDATE notifications
            SET is_read = 1, type = 'invite_result', message = :message
            WHERE user_id = :user_id
              AND reference_id = :reference_id
              AND type = 'invite'
        ");
        $updNotif->execute([
            ":message" => $receiverMsg,
            ":user_id" => (string)$invite['receiver_id'],
            ":reference_id" => (string)$data->invitation_id
        ]);

        // Notify sender about the response
        $senderMsg = $status === 'accepted'
            ? "{$receiver_name} accepted your invitation to join \"{$team_name}\"."
            : "{$receiver_name} rejected your invitation to join \"{$team_name}\".";
        competex_notify_user($db, (string)$invite['sender_id'], "invite_result", $senderMsg, (string)$data->invitation_id);

        $db->commit();
        echo json_encode(["status" => "success", "message" => "Invitation " . $status]);

    } catch(PDOException $e) {
        $db->rollBack();
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Incomplete data."]);
}
?>
