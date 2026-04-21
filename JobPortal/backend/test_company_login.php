<?php
require_once __DIR__ . '/config/database.php';

$database = new Database();
$conn = $database->getConnection();

$email = 'company@techcorp.com';
$password = 'password123';

echo "Testing login for: $email\n\n";

$stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if ($user) {
    echo "User found:\n";
    echo "  User ID: {$user['user_id']}\n";
    echo "  Email: {$user['email']}\n";
    echo "  Role: {$user['role']}\n";
    echo "  Status: {$user['status']}\n";
    echo "  Email Verified: " . ($user['email_verified'] ? 'Yes' : 'No') . "\n";
    echo "  Password Hash: {$user['password_hash']}\n\n";
    
    $verify = password_verify($password, $user['password_hash']);
    echo "Password verification result: " . ($verify ? 'SUCCESS' : 'FAILED') . "\n";
    
    if (!$verify) {
        echo "\nGenerating new hash...\n";
        $newHash = password_hash($password, PASSWORD_DEFAULT);
        echo "New hash: $newHash\n";
        
        $stmt = $conn->prepare("UPDATE users SET password_hash = ? WHERE user_id = ?");
        $stmt->execute([$newHash, $user['user_id']]);
        echo "Password hash updated in database\n";
        echo "Please try logging in again\n";
    }
} else {
    echo "User not found!\n";
}
