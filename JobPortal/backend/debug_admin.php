<?php
require_once __DIR__ . '/config/database.php';

$database = new Database();
$conn = $database->getConnection();

echo "=== DEBUG: Check Admin User ===\n\n";

// Check all admin users
$stmt = $conn->prepare("SELECT * FROM users WHERE role = 'admin'");
$stmt->execute();
$admins = $stmt->fetchAll();

if (empty($admins)) {
    echo "No admin users found!\n";
} else {
    echo "Found " . count($admins) . " admin user(s):\n";
    foreach ($admins as $admin) {
        echo "- User ID: {$admin['user_id']}\n";
        echo "  Email: {$admin['email']}\n";
        echo "  Role: {$admin['role']}\n";
        echo "  Status: {$admin['status']}\n";
        echo "  Email Verified: " . ($admin['email_verified'] ? 'Yes' : 'No') . "\n";
        echo "  Password Hash: {$admin['password_hash']}\n";
        echo "\n";
    }
}

// Test password verification
$email = 'falmitesfaye@gmail.com';
$password = 'oromoon1@job';

$stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if ($user) {
    echo "Testing password for $email:\n";
    $verify = password_verify($password, $user['password_hash']);
    echo "Password verification: " . ($verify ? 'SUCCESS' : 'FAILED') . "\n";
    
    // Generate new hash for comparison
    $newHash = password_hash($password, PASSWORD_DEFAULT);
    echo "New hash would be: $newHash\n";
} else {
    echo "User with email $email not found!\n";
}
