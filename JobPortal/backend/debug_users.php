<?php
require_once __DIR__ . '/config/database.php';

$database = new Database();
$conn = $database->getConnection();

echo "=== DEBUG: Check All Users ===\n\n";

// Check all users
$stmt = $conn->query("SELECT user_id, email, role, status, email_verified FROM users ORDER BY user_id");
$users = $stmt->fetchAll();

if (empty($users)) {
    echo "No users found!\n";
} else {
    echo "Found " . count($users) . " user(s):\n";
    foreach ($users as $user) {
        echo "- User ID: {$user['user_id']}\n";
        echo "  Email: {$user['email']}\n";
        echo "  Role: {$user['role']}\n";
        echo "  Status: {$user['status']}\n";
        echo "  Email Verified: " . ($user['email_verified'] ? 'Yes' : 'No') . "\n";
        echo "\n";
    }
}

// Check companies
echo "=== Companies ===\n\n";
$stmt = $conn->query("SELECT * FROM companies");
$companies = $stmt->fetchAll();

foreach ($companies as $company) {
    echo "- Company ID: {$company['company_id']}\n";
    echo "  User ID: {$company['user_id']}\n";
    echo "  Company Name: {$company['company_name']}\n";
    echo "  Contact Email: {$company['contact_email']}\n";
    echo "\n";
}
