<?php
require_once __DIR__ . '/config/database.php';

$database = new Database();
$conn = $database->getConnection();

$email = 'falmitesfaye@gmail.com';
$password = 'oromoon1@job';
$hash = password_hash($password, PASSWORD_DEFAULT);

// Check if admin exists
$stmt = $conn->prepare("SELECT user_id FROM users WHERE role = 'admin'");
$stmt->execute();
$admin = $stmt->fetch();

if ($admin) {
    // Update existing admin
    $stmt = $conn->prepare("UPDATE users SET email = ?, password_hash = ? WHERE role = 'admin'");
    $stmt->execute([$email, $hash]);
    echo "Admin credentials updated successfully\n";
    echo "Email: $email\n";
    echo "Password: $password\n";
} else {
    // Insert new admin
    $stmt = $conn->prepare("INSERT INTO users (email, password_hash, role, status, email_verified) VALUES (?, ?, 'admin', 'active', TRUE)");
    $stmt->execute([$email, $hash]);
    echo "Admin created successfully\n";
    echo "Email: $email\n";
    echo "Password: $password\n";
}
