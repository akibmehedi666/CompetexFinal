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
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$institution_id = isset($_GET['institution_id']) ? trim((string)$_GET['institution_id']) : '';
if ($institution_id === '') {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing institution_id"]);
    $conn->close();
    exit();
}

function mapEventRow(array $row): array {
    // Decode JSON fields
    $row['prizes'] = isset($row['prizes']) ? json_decode($row['prizes']) : [];
    $row['tags'] = isset($row['tags']) ? json_decode($row['tags']) : [];

    // Remap to match frontend Event type conventions (camelCase)
    $row['startDate'] = $row['start_date'] ?? null;
    $row['maxParticipants'] = isset($row['max_participants']) ? (int)$row['max_participants'] : 0;
    $row['participantsCount'] = isset($row['participants_count']) ? (int)$row['participants_count'] : 0;
    $row['registrationType'] = $row['registration_type'] ?? null;
    $row['maxTeams'] = isset($row['max_teams']) ? (int)$row['max_teams'] : 0;
    $row['registrationDeadline'] = $row['registration_deadline'] ?? null;
    $row['registrationFee'] = isset($row['registration_fee']) ? (float)$row['registration_fee'] : 0.0;
    $row['organizerEmail'] = $row['contact_email'] ?? null;
    $row['organizerPhone'] = $row['contact_phone'] ?? null;
    $row['organizerId'] = $row['organizer_id'] ?? null;
    $row['avg_rating'] = isset($row['avg_rating']) ? (float)$row['avg_rating'] : 0.0;
    $row['rating_count'] = isset($row['rating_count']) ? (int)$row['rating_count'] : 0;

    // Clean up
    unset($row['start_date'], $row['max_participants'], $row['participants_count'], $row['registration_type'], $row['max_teams'], $row['registration_deadline'], $row['registration_fee'], $row['contact_email'], $row['contact_phone'], $row['organizer_id']);

    return $row;
}

try {
    // Expects schema to be provisioned from `competex_db.sql` (no table creation at runtime).

    // Institution core info (DB-driven from organizer_profiles + hosted events)
    $instSql = "
        SELECT
            op.user_id AS institution_id,
            op.organization_name AS name,
            op.website,
            op.is_institution,
            COUNT(e.id) AS total_events,
            SUM(
                CASE
                    WHEN e.start_date IS NOT NULL
                     AND e.start_date >= NOW()
                     AND e.status IN ('Upcoming','Live')
                    THEN 1 ELSE 0
                END
            ) AS upcoming_events,
            MAX(e.start_date) AS last_event_date,
            (
                SELECT e2.venue
                FROM events e2
                WHERE e2.organizer_id = op.user_id
                  AND e2.venue IS NOT NULL
                  AND e2.venue <> ''
                ORDER BY e2.start_date DESC, e2.created_at DESC
                LIMIT 1
            ) AS location
        FROM organizer_profiles op
        JOIN users u ON u.id = op.user_id AND u.role IN ('Organizer','organizer')
        JOIN events e ON e.organizer_id = op.user_id
        WHERE op.is_institution = 1
          AND op.user_id = ?
        GROUP BY op.user_id, op.organization_name, op.website, op.is_institution
        LIMIT 1
    ";
    $stmtI = $conn->prepare($instSql);
    $stmtI->bind_param("s", $institution_id);
    $stmtI->execute();
    $instRes = $stmtI->get_result();
    $institution = $instRes ? $instRes->fetch_assoc() : null;
    $stmtI->close();

    if (!$institution) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Institution not found"]);
        $conn->close();
        exit();
    }

    $institution["total_events"] = (int)($institution["total_events"] ?? 0);
    $institution["upcoming_events"] = (int)($institution["upcoming_events"] ?? 0);
    $institution["is_institution"] = (int)($institution["is_institution"] ?? 0) === 1;

    $computedStatus = "CASE
        WHEN e.status = 'Live' THEN 'Live'
        WHEN e.start_date IS NOT NULL AND e.start_date <> '0000-00-00 00:00:00' THEN
            CASE WHEN e.start_date < NOW() THEN 'Ended' ELSE 'Upcoming' END
        WHEN e.status IN ('Ended','Completed') THEN 'Ended'
        ELSE e.status
    END";

    // Fetch all events for this institution and classify in SQL
    $eventsSql = "
        SELECT
            e.id,
            e.title,
            e.description,
            e.category,
            e.mode,
            ($computedStatus) AS status,
            e.date_display AS date,
            e.start_date,
            e.venue,
            e.max_participants,
            e.participants_count,
            e.image,
            e.prizes,
            e.tags,
            e.registration_type,
            e.max_teams,
            e.registration_deadline,
            e.contact_email,
            e.contact_phone,
            e.registration_fee,
            e.organizer_id,
            COALESCE(er.avg_rating, 0) AS avg_rating,
            COALESCE(er.rating_count, 0) AS rating_count,
            CASE
                WHEN ($computedStatus) IN ('Upcoming','Live') THEN 'upcoming'
                ELSE 'archive'
            END AS bucket
        FROM events e
        LEFT JOIN (
            SELECT event_id, AVG(rating) AS avg_rating, COUNT(*) AS rating_count
            FROM event_reviews
            GROUP BY event_id
        ) er ON er.event_id = e.id
        WHERE e.organizer_id = ?
        ORDER BY
            bucket ASC,
            e.start_date ASC,
            e.created_at DESC
    ";
    $stmtE = $conn->prepare($eventsSql);
    $stmtE->bind_param("s", $institution_id);
    $stmtE->execute();
    $evRes = $stmtE->get_result();

    $upcoming = [];
    $archive = [];
    while ($evRes && ($row = $evRes->fetch_assoc())) {
        $bucket = $row["bucket"] ?? "archive";
        unset($row["bucket"]);
        $mapped = mapEventRow($row);
        if ($bucket === "upcoming") {
            $upcoming[] = $mapped;
        } else {
            $archive[] = $mapped;
        }
    }
    $stmtE->close();

    echo json_encode([
        "status" => "success",
        "institution" => $institution,
        "upcoming_events" => $upcoming,
        "archive_events" => $archive
    ]);
} catch (mysqli_sql_exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
} finally {
    $conn->close();
}
?>
