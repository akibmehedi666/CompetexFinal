<?php
require 'db_connect.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || empty($data['email']) || empty($data['password'])) {
    echo json_encode(["status" => "error", "message" => "Email and password are required"]);
    exit;
}

$email = $conn->real_escape_string($data['email']);
$password = $data['password'];

$sql = "SELECT u.id, u.name, u.email, u.password, u.role, u.university, u.skills, u.avatar, u.bio, u.github, u.linkedin, u.portfolio, u.profile_visibility, u.verified, u.department, u.location,
        sp.company_name, sp.description as sponsor_bio
        FROM users u
        LEFT JOIN sponsor_profiles sp ON u.id = sp.user_id
        WHERE u.email = '$email'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    if (password_verify($password, $user['password'])) {
        // Remove password from response
        unset($user['password']);
        echo json_encode([
            "status" => "success",
            "message" => "Login successful",
            "user" => $user
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid credentials"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "User not found"]);
}

$conn->close();
?>