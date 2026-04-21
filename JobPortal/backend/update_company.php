<?php
require_once __DIR__ . '/config/database.php';

$database = new Database();
$conn = $database->getConnection();

$email = 'company@techcorp.com';
$password = 'password123';
$hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $conn->prepare("UPDATE users SET password_hash = ? WHERE email = ?");
$stmt->execute([$hash, $email]);

echo "Company password updated successfully\n";
echo "Email: $email\n";
echo "Password: $password\n";

// Also update company name
$stmt = $conn->prepare("UPDATE companies SET company_name = ? WHERE user_id = (SELECT user_id FROM users WHERE email = ?)");
$stmt->execute(['TechCorp Company', $email]);

echo "Company name updated to: TechCorp Company\n";
