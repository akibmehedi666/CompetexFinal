<?php
// Script to test the full Event Registration Flow

$baseUrl = "http://localhost/Competex/api";

function callAPI($method, $url, $data = false)
{
    $curl = curl_init();
    if ($data)
        echo "Sending Data: " . json_encode($data) . "\n";

    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    // curl_setopt($curl, CURLOPT_VERBOSE, 1); // Debug

    if ($method == "POST") {
        curl_setopt($curl, CURLOPT_POST, 1);
        if ($data)
            curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($data));
    }

    curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));

    $result = curl_exec($curl);
    curl_close($curl);
    return $result;
}

echo "=== 1. Create Dummy Event ===\n";
// Manually creating a dummy event ID for test if not exists or use existing
$event_id = "test_event_" . uniqid();
// In a real test we'd hit create_event.php, but let's assume valid ID for db
include 'db_connect.php';
$conn->query("INSERT INTO events (id, organizer_id, title, category, mode, status, date_display, start_date) 
              VALUES ('$event_id', 'org_1', 'Test Event', 'Hack', 'Online', 'Upcoming', 'TBD', NOW())");
echo "Created Event: $event_id\n\n";

echo "=== 2. Create Dummy Team & Leader ===\n";
$team_id = "test_team_" . uniqid();
$user_id = "test_leader_" . uniqid();
$conn->query("INSERT INTO teams (id, name, leader_id, status) VALUES ('$team_id', 'Test Team', '$user_id', 'open')");
echo "Created Team: $team_id with Leader: $user_id\n\n";
$conn->close();


echo "=== 3. REQUEST TO JOIN ===\n";
$url = $baseUrl . "/request_event_join.php";
$data = ["event_id" => $event_id, "team_id" => $team_id, "user_id" => $user_id];
$response = callAPI("POST", $url, $data);
echo "Response: " . $response . "\n\n";
$respJson = json_decode($response);
$request_id = $respJson->request_id ?? null;

if (!$request_id) {
    echo "FAILED: No request_id returned.\n";
    exit();
}

echo "=== 4. GET REQUESTS (Organizer) ===\n";
$url = $baseUrl . "/get_event_requests.php?event_id=" . $event_id;
$response = callAPI("GET", $url);
echo "Response: " . $response . "\n\n";


echo "=== 5. APPROVE REQUEST ===\n";
$url = $baseUrl . "/update_event_request.php";
$data = ["request_id" => $request_id, "status" => "approved"];
$response = callAPI("POST", $url, $data);
echo "Response: " . $response . "\n\n";


echo "=== 6. CHECK STATUS (Should be Approved, Not Enrolled) ===\n";
$url = $baseUrl . "/get_team_event_status.php?event_id=$event_id&team_id=$team_id";
$response = callAPI("GET", $url);
echo "Response: " . $response . "\n\n";


echo "=== 7. ENROLL TEAM ===\n";
$url = $baseUrl . "/enroll_team_event.php";
$data = ["event_id" => $event_id, "team_id" => $team_id, "user_id" => $user_id];
$response = callAPI("POST", $url, $data);
echo "Response: " . $response . "\n\n";


echo "=== 8. CHECK STATUS (Should be Enrolled) ===\n";
$url = $baseUrl . "/get_team_event_status.php?event_id=$event_id&team_id=$team_id";
$response = callAPI("GET", $url);
echo "Response: " . $response . "\n\n";

?>