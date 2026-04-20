<?php
// IMPORTANT: No whitespace before this file

$allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:5175',
    'http://127.0.0.1:5175',
    'http://localhost',
    'http://127.0.0.1',
    null, // Allow requests with no origin (e.g., Postman, mobile apps)
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? null;

// Always send CORS headers - use specific origin if allowed
if ($origin && in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
} elseif (!$origin) {
    // For requests without origin (direct browser requests, mobile apps)
    header("Access-Control-Allow-Origin: *");
} else {
    // For unknown origins in development, allow but log
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
}

// Required headers
header("Vary: Origin");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept");
header("Access-Control-Expose-Headers: Authorization");

// Handle preflight request (VERY IMPORTANT)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}