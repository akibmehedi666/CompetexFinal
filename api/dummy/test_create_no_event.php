<?php
// Test Script: Create Team WITHOUT Event
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

$base_url = "http://localhost/Competex/api";
$leader_id = "07cdc915-05ff-45ac-a876-3f698acf7c5f"; // himu (Organizer)

echo "--- TEST: Create Team No Event ---\n\n";

$data = [
    "name" => "General Team " . rand(100, 999),
    "leader_id" => $leader_id,
    "max_members" => 5,
    "description" => "Team with no event attached.",
    "project_idea" => "General project",
    "competition_id" => "", // Simulating empty string from frontend
    "required_skills" => ["General"]
];

$res = send_post("$base_url/create_team.php", $data);

echo "Status: " . $res['code'] . "\n";
echo "Response: " . $res['body'] . "\n";

if ($res['code'] == 201) {
    echo "\n✅ SUCCESS: Team created without event.\n";
} else {
    echo "\n❌ FAILED: " . $res['body'] . "\n";
}
?>