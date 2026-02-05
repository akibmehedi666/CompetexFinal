<?php
// Test Script for Join Flow
header("Content-Type: text/plain");

function send_post($url, $data)
{
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
    $response = curl_exec($ch);
    $info = curl_getinfo($ch);
    curl_close($ch);
    return ["code" => $info['http_code'], "body" => $response];
}

echo "--- STARTING JOIN FLOW TEST ---\n\n";

// 0. Configuration
$base_url = "http://localhost/Competex/api";
$leader_id = "6635c06e-22c9-4807-a99e-a3bf3d730a87"; // Partha
$requester_id = "8eaa9722-0b7c-4d1d-b8e4-4c27a40e3dfb"; // Akib
$team_id = "697309f297636"; // Created in previous test

echo "Team ID: $team_id\n";
echo "Leader ID: $leader_id\n";
echo "Requester ID: $requester_id\n\n";

// 1. Request Join
echo "1. Sending Join Request...\n";
$req1 = send_post("$base_url/request_join.php", [
    "team_id" => $team_id,
    "user_id" => $requester_id
]);
echo "Status: " . $req1['code'] . "\nResponse: " . $req1['body'] . "\n\n";

// 2. Fetch Requests (Verify it appears)
echo "2. Fetching Pending Requests...\n";
$req2 = file_get_contents("$base_url/get_team_requests.php?team_id=$team_id");
$requests = json_decode($req2, true);
echo "Pending Requests Count: " . count($requests) . "\n";
print_r($requests);
echo "\n";

if (empty($requests)) {
    die("❌ Test Failed: No requests found.\n");
}

$request_id = $requests[0]['request_id'];
echo "Captured Request ID: $request_id\n\n";

// 3. Accept Request
echo "3. Accepting Request...\n";
$req3 = send_post("$base_url/respond_request.php", [
    "request_id" => $request_id,
    "action" => "accept",
    "leader_id" => $leader_id
]);
echo "Status: " . $req3['code'] . "\nResponse: " . $req3['body'] . "\n\n";

// 4. Verify Member Added
echo "4. Verifying Membership...\n";
$req4 = file_get_contents("$base_url/get_teams.php");
$teams = json_decode($req4, true);
$target_team = null;
foreach ($teams as $t) {
    if ($t['id'] === $team_id) {
        $target_team = $t;
        break;
    }
}

if ($target_team) {
    echo "Found Team. Members:\n";
    $found = false;
    foreach ($target_team['members'] as $m) {
        echo "- " . $m['name'] . " (" . $m['role'] . ")\n";
        if ($m['id'] === $requester_id)
            $found = true;
    }

    if ($found) {
        echo "\n✅ SUCCESS: Requester is now a member!\n";
    } else {
        echo "\n❌ FAILURE: Requester not found in team members.\n";
    }
} else {
    echo "❌ error: Team not found in list.\n";
}
?>