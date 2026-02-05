<?php
// Include the database connection file
require_once 'db_connect.php';

// Set headers to allow cross-origin requests (CORS) from the frontend
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get the raw POST data
$data = json_decode(file_get_contents("php://input"));

// Check if data is valid
if (!$data) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid input data"]);
    exit();
}

// Extract data from the request object
// Using null coalescing operator to handle missing optional fields
$title = $data->title ?? null;
$description = $data->description ?? null;
$category = $data->category ?? 'Hackathon';
$mode = $data->mode ?? 'Offline';
$status = 'Upcoming'; // Default status for new events
$date_display = $data->date ?? ''; // The string representation e.g. "Jan 15-17"
$start_date = $data->startDate ?? null;
$venue = $data->venue ?? null;
$max_participants = $data->maxParticipants ?? 0;
$organizer_id = $data->organizerId ?? null;
$image = $data->image ?? null;
$registration_deadline = $data->registrationDeadline ?? null;
$registration_type = $data->registrationType ?? 'individual';
$max_teams = $data->maxTeams ?? 0;
$contact_email = $data->organizerEmail ?? null;
$contact_phone = $data->organizerPhone ?? null;
$registration_fee = isset($data->registrationFee) ? floatval($data->registrationFee) : 0.0;

// Validate required fields
if (!$title || !$organizer_id) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing required fields: title or organizerId"]);
    exit();
}

// Handle JSON fields (prizes, tags)
$prizes = isset($data->prizes) ? json_encode($data->prizes) : '[]';
$tags = isset($data->tags) ? json_encode($data->tags) : '[]';

// Generate a UUID for the event ID
function generate_uuid()
{
    return sprintf(
        '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0xffff)
    );
}

$id = generate_uuid();

// Check if organizer exists (optional safety check, ensuring data integrity)
// For simplicity in this demo, we assume the frontend sends a valid UUID.

// Prepare SQL statement to insert data into the 'events' table
// We use prepared statements to prevent SQL injection
$sql = "INSERT INTO events (
            id, organizer_id, title, description, category, mode, status, 
            date_display, start_date, venue, max_participants, image, 
            prizes, registration_deadline, tags, registration_type, max_teams,
            contact_email, contact_phone, registration_fee
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, 
            ?, ?, ?, ?, ?, 
            ?, ?, ?, ?, ?,
            ?, ?, ?
        )";

$stmt = $conn->prepare($sql);

if ($stmt) {
    // Bind parameters to the query
    // s = string, i = integer
    $stmt->bind_param(
        "ssssssssssisssssissd",
        $id,
        $organizer_id,
        $title,
        $description,
        $category,
        $mode,
        $status,
        $date_display,
        $start_date,
        $venue,
        $max_participants,
        $image,
        $prizes,
        $registration_deadline,
        $tags,
        $registration_type,
        $max_teams,
        $contact_email,
        $contact_phone,
        $registration_fee
    );

    // Execute the query
    if ($stmt->execute()) {
        http_response_code(201); // Created
        echo json_encode([
            "status" => "success",
            "message" => "Event created successfully",
            "event_id" => $id
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database error: " . $stmt->error]);
    }

    $stmt->close();
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Statement preparation failed: " . $conn->error]);
}

$conn->close();
?>
