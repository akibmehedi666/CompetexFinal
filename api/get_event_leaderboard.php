<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db_connect.php';

if (!isset($_GET['event_id'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing event_id"]);
    exit();
}

$event_id = $_GET['event_id'];
$entries = [];

// Manual leaderboard (if leaderboards table exists and has rows for this event)
$lb_table_check = $conn->query("SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'leaderboards' LIMIT 1");
$has_leaderboards_table = $lb_table_check && $lb_table_check->num_rows > 0;

if ($has_leaderboards_table) {
    $hasRowsStmt = $conn->prepare("SELECT 1 FROM leaderboards WHERE event_id = ? LIMIT 1");
    if ($hasRowsStmt) {
        $hasRowsStmt->bind_param("s", $event_id);
        $hasRowsStmt->execute();
        $hasRowsRes = $hasRowsStmt->get_result();
        $hasRows = $hasRowsRes && $hasRowsRes->num_rows > 0;
        $hasRowsStmt->close();

        if ($hasRows) {
            $manualSql = "
                SELECT
                    l.position AS rank,
                    u.name AS name,
                    u.university AS institution,
                    u.avatar AS avatar,
                    l.points AS score
                FROM leaderboards l
                JOIN users u ON l.user_id = u.id
                WHERE l.event_id = ?
                ORDER BY l.position ASC, u.name ASC
            ";

            $stmt = $conn->prepare($manualSql);
            if ($stmt) {
                $stmt->bind_param("s", $event_id);
                $stmt->execute();
                $res = $stmt->get_result();
                $ranked = [];
                if ($res) {
                    while ($row = $res->fetch_assoc()) {
                        $ranked[] = [
                            "rank" => (int) $row["rank"],
                            "name" => $row["name"],
                            "score" => (int) $row["score"],
                            "avatar" => $row["avatar"],
                            "institution" => $row["institution"]
                        ];
                    }
                }
                $stmt->close();

                echo json_encode(["status" => "success", "data" => $ranked]);
                $conn->close();
                exit();
            }
        }
    }
}

// Team leaderboard (aggregate user_stats points for team members)
$team_sql = "SELECT t.id as team_id, t.name as team_name, COALESCE(SUM(us.points), 0) as score
             FROM event_teams et
             JOIN teams t ON et.team_id = t.id
             LEFT JOIN team_members tm ON tm.team_id = t.id
             LEFT JOIN user_stats us ON us.user_id = tm.user_id
             WHERE et.event_id = ?
             GROUP BY t.id, t.name
             ORDER BY score DESC, t.name ASC";

$stmt = $conn->prepare($team_sql);
if ($stmt) {
    $stmt->bind_param("s", $event_id);
    $stmt->execute();
    $res = $stmt->get_result();
    if ($res) {
        while ($row = $res->fetch_assoc()) {
            $entries[] = [
                "name" => $row["team_name"],
                "score" => (int) $row["score"],
                "avatar" => null,
                "institution" => null,
                "type" => "team"
            ];
        }
    }
    $stmt->close();
}

// Individual leaderboard (only if event_participants table exists)
$table_check = $conn->query("SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'event_participants' LIMIT 1");
$has_participants_table = $table_check && $table_check->num_rows > 0;

if ($has_participants_table) {
    $ind_sql = "SELECT u.id as user_id, u.name, u.university, u.avatar, COALESCE(us.points, 0) as score
                FROM event_participants ep
                JOIN users u ON ep.user_id = u.id
                LEFT JOIN user_stats us ON us.user_id = u.id
                WHERE ep.event_id = ?
                ORDER BY score DESC, u.name ASC";

    $stmt = $conn->prepare($ind_sql);
    if ($stmt) {
        $stmt->bind_param("s", $event_id);
        $stmt->execute();
        $res = $stmt->get_result();
        if ($res) {
            while ($row = $res->fetch_assoc()) {
                $entries[] = [
                    "name" => $row["name"],
                    "score" => (int) $row["score"],
                    "avatar" => $row["avatar"],
                    "institution" => $row["university"],
                    "type" => "individual"
                ];
            }
        }
        $stmt->close();
    }
}

// Sort and assign rank
usort($entries, function ($a, $b) {
    if ($a["score"] === $b["score"]) {
        return strcmp($a["name"], $b["name"]);
    }
    return ($a["score"] > $b["score"]) ? -1 : 1;
});

$ranked = [];
$rank = 1;
foreach ($entries as $entry) {
    $entry["rank"] = $rank;
    $ranked[] = $entry;
    $rank++;
}

echo json_encode(["status" => "success", "data" => $ranked]);
$conn->close();
?>
