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

$recruiter_id = isset($_GET['recruiter_id']) ? trim((string)$_GET['recruiter_id']) : '';
if ($recruiter_id === '') {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing recruiter_id"]);
    $conn->close();
    exit();
}

// SQL-level role enforcement (Recruiter only)
$stmtRole = $conn->prepare("SELECT 1 FROM users WHERE id = ? AND role IN ('Recruiter','recruiter') LIMIT 1");
if (!$stmtRole) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $conn->error]);
    $conn->close();
    exit();
}
$stmtRole->bind_param("s", $recruiter_id);
$stmtRole->execute();
$roleRes = $stmtRole->get_result();
$isRecruiter = $roleRes && $roleRes->num_rows > 0;
$stmtRole->close();

if (!$isRecruiter) {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Access denied"]);
    $conn->close();
    exit();
}

// Expects schema to be provisioned from competex_db.sql (no table creation at runtime).

// Top 3 participants per event:
// - If an event has manual leaderboards rows -> use position <= 3
// - Else compute from event_participants + user_stats points
$participantsSql = "
WITH manual_events AS (
    SELECT DISTINCT event_id FROM leaderboards
),
manual_top AS (
    SELECT
        e.id AS event_id,
        e.title AS event_title,
        e.category,
        e.status,
        e.date_display,
        e.start_date,
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'user_id', u.id,
                'name', u.name,
                'university', u.university,
                'avatar', u.avatar,
                'points', l.points,
                'rank', l.position
            )
        ) AS winners
    FROM events e
    JOIN leaderboards l ON l.event_id = e.id AND l.position <= 3
    JOIN users u ON u.id = l.user_id
    GROUP BY e.id, e.title, e.category, e.status, e.date_display, e.start_date
),
computed_ranked AS (
    SELECT
        e.id AS event_id,
        e.title AS event_title,
        e.category,
        e.status,
        e.date_display,
        e.start_date,
        u.id AS user_id,
        u.name,
        u.university,
        u.avatar,
        COALESCE(us.points, 0) AS points,
        ROW_NUMBER() OVER (
            PARTITION BY e.id
            ORDER BY COALESCE(us.points, 0) DESC, u.name ASC
        ) AS rn
    FROM events e
    JOIN event_participants ep ON ep.event_id = e.id
    JOIN users u ON u.id = ep.user_id
    LEFT JOIN user_stats us ON us.user_id = u.id
    WHERE e.id NOT IN (SELECT event_id FROM manual_events)
),
computed_top AS (
    SELECT
        event_id,
        event_title,
        category,
        status,
        date_display,
        start_date,
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'user_id', user_id,
                'name', name,
                'university', university,
                'avatar', avatar,
                'points', points,
                'rank', rn
            )
        ) AS winners
    FROM computed_ranked
    WHERE rn <= 3
    GROUP BY event_id, event_title, category, status, date_display, start_date
)
SELECT * FROM manual_top
UNION ALL
SELECT * FROM computed_top
ORDER BY COALESCE(start_date, '9999-12-31') DESC, event_title ASC
";

$participants = [];
$resP = $conn->query($participantsSql);
if ($resP) {
    while ($row = $resP->fetch_assoc()) {
        $winners = [];
        if (isset($row["winners"]) && $row["winners"] !== null && $row["winners"] !== '') {
            $decoded = json_decode($row["winners"], true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $winners = $decoded;
            }
        }
        $row["winners"] = $winners;
        $participants[] = $row;
    }
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $conn->error]);
    $conn->close();
    exit();
}

// Top 3 teams per team event, including all team members
$teamsSql = "
WITH team_scores AS (
    SELECT
        e.id AS event_id,
        e.title AS event_title,
        e.category,
        e.status,
        e.date_display,
        e.start_date,
        t.id AS team_id,
        t.name AS team_name,
        t.leader_id,
        COALESCE(SUM(us.points), 0) AS score
    FROM events e
    JOIN event_teams et ON et.event_id = e.id
    JOIN teams t ON t.id = et.team_id
    LEFT JOIN team_members tm ON tm.team_id = t.id
    LEFT JOIN user_stats us ON us.user_id = tm.user_id
    WHERE e.registration_type = 'team'
    GROUP BY e.id, e.title, e.category, e.status, e.date_display, e.start_date, t.id, t.name, t.leader_id
),
ranked AS (
    SELECT
        *,
        ROW_NUMBER() OVER (
            PARTITION BY event_id
            ORDER BY score DESC, team_name ASC
        ) AS rn
    FROM team_scores
),
top_ranked AS (
    SELECT * FROM ranked WHERE rn <= 3
)
SELECT
    tr.event_id,
    tr.event_title,
    tr.category,
    tr.status,
    tr.date_display,
    tr.start_date,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'team_id', tr.team_id,
            'team_name', tr.team_name,
            'leader_id', tr.leader_id,
            'score', tr.score,
            'rank', tr.rn,
            'members', (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'user_id', u.id,
                        'name', u.name,
                        'university', u.university,
                        'avatar', u.avatar,
                        'is_leader', IF(u.id = t2.leader_id, 1, 0)
                    )
                )
                FROM team_members tm2
                JOIN users u ON u.id = tm2.user_id
                JOIN teams t2 ON t2.id = tm2.team_id
                WHERE tm2.team_id = tr.team_id
            )
        )
    ) AS teams
FROM top_ranked tr
GROUP BY tr.event_id, tr.event_title, tr.category, tr.status, tr.date_display, tr.start_date
ORDER BY COALESCE(tr.start_date, '9999-12-31') DESC, tr.event_title ASC
";

$teams = [];
$resT = $conn->query($teamsSql);
if ($resT) {
    while ($row = $resT->fetch_assoc()) {
        $decodedTeams = [];
        if (isset($row["teams"]) && $row["teams"] !== null && $row["teams"] !== '') {
            $decoded = json_decode($row["teams"], true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $decodedTeams = $decoded;
            }
        }
        $row["teams"] = $decodedTeams;
        $teams[] = $row;
    }
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $conn->error]);
    $conn->close();
    exit();
}

echo json_encode([
    "status" => "success",
    "data" => [
        "top_participants_by_event" => $participants,
        "top_teams_by_event" => $teams
    ]
]);

$conn->close();
?>
