<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db_connect.php';

$user_id = isset($_GET['user_id']) ? $conn->real_escape_string($_GET['user_id']) : null;

if (!$user_id) {
    echo json_encode([]);
    exit;
}

// Complex query to get latest message for each conversation
// We need to group by the OTHER user (partner)
$sql = "
SELECT 
    CASE 
        WHEN sender_id = '$user_id' THEN recipient_id 
        ELSE sender_id 
    END AS partner_id,
    u.name as partner_name,
    u.avatar as partner_avatar,
    m.content as last_message,
    m.created_at as time,
    m.is_read
FROM messages m
JOIN users u ON u.id = (CASE WHEN m.sender_id = '$user_id' THEN m.recipient_id ELSE m.sender_id END)
WHERE m.id IN (
    SELECT MAX(id) 
    FROM messages 
    WHERE sender_id = '$user_id' OR recipient_id = '$user_id'
    GROUP BY CASE 
        WHEN sender_id = '$user_id' THEN recipient_id 
        ELSE sender_id 
    END
)
ORDER BY m.created_at DESC
";

// Ideally we'd optimize the subquery, but for now this works for basic messaging
// Limitation: String ID MAX might not be chronological if not UUIDs are not ordered by time, but created_at is strictly better.
// Actually, using MAX(created_at) is better inside subquery, but matching back to ID is safer if created_at duplicates.
// Let's rely on created_at sorting.

// Recalculating query to be robust:
$sql = "
SELECT 
    contact_id as partner_id,
    u.name as partner_name,
    u.avatar as partner_avatar,
    m.content as last_message,
    m.created_at as time,
    m.sender_id
FROM (
    SELECT 
        CASE 
            WHEN sender_id = '$user_id' THEN recipient_id 
            ELSE sender_id 
        END AS contact_id,
        MAX(created_at) as max_time
    FROM messages
    WHERE sender_id = '$user_id' OR recipient_id = '$user_id'
    GROUP BY contact_id
) latest
JOIN messages m ON 
    (m.sender_id = '$user_id' AND m.recipient_id = latest.contact_id AND m.created_at = latest.max_time) 
    OR 
    (m.recipient_id = '$user_id' AND m.sender_id = latest.contact_id AND m.created_at = latest.max_time)
JOIN users u ON u.id = latest.contact_id
ORDER BY latest.max_time DESC
";


$result = $conn->query($sql);
$conversations = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $conversations[] = [
            "id" => $row['partner_id'],
            "name" => $row['partner_name'],
            "avatar" => $row['partner_avatar'] ?? "https://api.dicebear.com/7.x/avataaars/svg?seed=" . urlencode($row['partner_name']),
            "lastMessage" => $row['last_message'],
            "time" => date("g:i A", strtotime($row['time'])), // Format time
            "unread" => 0, // Need to calculate real unread count
            "online" => false // Online status not tracked yet
        ];
    }
}

echo json_encode($conversations);
$conn->close();
?>