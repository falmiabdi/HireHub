<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'API is running',
    'timestamp' => date('Y-m-d H:i:s'),
    'version' => '1.0.0',
]);
