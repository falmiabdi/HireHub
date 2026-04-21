<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/models/Company.php';

$database = new Database();
$conn = $database->getConnection();

echo "=== DEBUG: Check Jobs Table ===\n\n";

// Count all jobs
$stmt = $conn->query("SELECT COUNT(*) as total FROM jobs");
$total = $stmt->fetch()['total'];
echo "Total jobs in database: $total\n\n";

// Show all jobs with company info
$stmt = $conn->query("
    SELECT j.*, c.company_name, c.user_id 
    FROM jobs j 
    LEFT JOIN companies c ON j.company_id = c.company_id 
    ORDER BY j.posted_date DESC 
    LIMIT 10
");
$jobs = $stmt->fetchAll();

if (empty($jobs)) {
    echo "No jobs found in database.\n";
} else {
    echo "Recent jobs:\n";
    foreach ($jobs as $job) {
        echo "- Job ID: {$job['job_id']}\n";
        echo "  Title: {$job['title']}\n";
        echo "  Company ID: {$job['company_id']}\n";
        echo "  Company Name: {$job['company_name']}\n";
        echo "  Company User ID: {$job['user_id']}\n";
        echo "  Status: {$job['status']}\n";
        echo "  Approval Status: {$job['approval_status']}\n";
        echo "  Posted Date: {$job['posted_date']}\n";
        echo "  Skills Required: " . ($job['skills_required'] ?? 'NULL') . "\n";
        echo "  Benefits: " . ($job['benefits'] ?? 'NULL') . "\n";
        echo "\n";
    }
}

// Check companies
echo "=== Companies Table ===\n\n";
$stmt = $conn->query("SELECT * FROM companies");
$companies = $stmt->fetchAll();

foreach ($companies as $company) {
    echo "- Company ID: {$company['company_id']}\n";
    echo "  User ID: {$company['user_id']}\n";
    echo "  Company Name: {$company['company_name']}\n";
    echo "\n";
}
