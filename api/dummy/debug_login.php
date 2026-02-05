<?php
require 'db_connect.php';

// Allow testing via GET or POST
$email = $_GET['email'] ?? $_POST['email'] ?? '';
$password = $_GET['password'] ?? $_POST['password'] ?? '';

echo "<h2>Login Debugger</h2>";
echo "<form method='POST'>
    Email: <input type='text' name='email' value='$email'><br>
    Password: <input type='text' name='password' value='$password'><br>
    <input type='submit' value='Check'>
    </form>";

if ($email) {
    echo "<h3>Results for: $email</h3>";
    
    // 1. Check if user exists in simple query
    $sql = "SELECT * FROM users WHERE email = '$email'";
    $result = $conn->query($sql);
    
    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        echo "<pre>User Found in DB:\n";
        print_r($user);
        echo "</pre>";
        
        // 2. Check Password
        echo "<b>Stored Password Hash:</b> " . $user['password'] . "<br>";
        echo "<b>Input Password:</b> $password<br>";
        
        if (password_verify($password, $user['password'])) {
             echo "<h3 style='color:green'>SUCCESS: password_verify passed!</h3>";
        } else {
             echo "<h3 style='color:red'>FAILURE: password_verify failed!</h3>";
             
             // Check if it's plain text (common issue if manually inserted)
             if ($password === $user['password']) {
                 echo "<p style='color:orange'>WARNING: The password in the DB matches the input exactly. It seems to be stored as PLAIN TEXT. PHP's password_verify expects a HASH.</p>";
                 echo "<p>To fix this, the password in the database needs to be hashed.</p>";
             } else {
                 echo "<p>The stored value is neither a valid hash matching the input nor the plain text.</p>";
             }
        }
        
    } else {
        echo "<h3 style='color:red'>User not found in 'users' table.</h3>";
    }
}
?>
