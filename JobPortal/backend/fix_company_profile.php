<?php
require_once __DIR__ . '/config/database.php';

$database = new Database();
$conn = $database->getConnection();

// Get the company user
$stmt = $conn->prepare("SELECT user_id, email FROM users WHERE email = 'company@techcorp.com'");
$stmt->execute();
$user = $stmt->fetch();

if ($user) {
    echo "Found company user:\n";
    echo "  User ID: {$user['user_id']}\n";
    echo "  Email: {$user['email']}\n\n";
    
    // Check if company profile exists
    $stmt = $conn->prepare("SELECT * FROM companies WHERE user_id = ?");
    $stmt->execute([$user['user_id']]);
    $company = $stmt->fetch();
    
    if ($company) {
        echo "Company profile exists:\n";
        echo "  Company ID: {$company['company_id']}\n";
        echo "  Company Name: {$company['company_name']}\n";
        
        // Update company name if empty
        if (empty($company['company_name'])) {
            $stmt = $conn->prepare("UPDATE companies SET company_name = ?, contact_email = ? WHERE user_id = ?");
            $stmt->execute(['TechCorp Company', $user['email'], $user['user_id']]);
            echo "Company name updated to: TechCorp Company\n";
        }
    } else {
        echo "Company profile does not exist. Creating...\n";
        $stmt = $conn->prepare("INSERT INTO companies (user_id, company_name, contact_email) VALUES (?, ?, ?)");
        $stmt->execute([$user['user_id'], 'TechCorp Company', $user['email']]);
        echo "Company profile created successfully\n";
    }
} else {
    echo "Company user not found!\n";
}
