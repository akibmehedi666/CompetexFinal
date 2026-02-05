<?php
// Test script for create_team.php

// 1. Get a valid event ID
$events_json = file_get_contents("http://localhost/Competex/api/get_events.php");
$events = json_decode($events_json, true);

if (empty($events)) {
    die("Error: No events found to test with.\n");
}

$event_id = $events[0]['id'];
echo "Using Event ID: " . $event_id . "\n";

// 2. Prepare Team Data
$data = [
    "name" => "Backend Test Team " . rand(100, 999),
    "leader_id" => "6635c06e-22c9-4807-a99e-a3bf3d730a87", // Partha Podder
    "max_members" => 4,
    "description" => "Testing via script",
    "project_idea" => "Automated Test",
    "competition_id" => $event_id,
    "required_skills" => ["PHP", "Testing"]
];

// 3. Send POST request
$ch = curl_init("http://localhost/Competex/api/create_team.php");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// 4. Output result
echo "HTTP Code: " . $http_code . "\n";
echo "Response: " . $response . "\n";
?>