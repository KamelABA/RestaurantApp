<?php

// Simple test script to verify the cashier API is working
echo "Testing Cashier API...\n\n";

// Test GET /api/cashiers
echo "1. Testing GET /api/cashiers\n";
$response = file_get_contents('http://localhost:8000/api/cashiers');
echo "Response: " . $response . "\n\n";

// Test POST /api/cashiers
echo "2. Testing POST /api/cashiers\n";
$data = [
    'name' => 'Test Cashier',
    'password' => 'test123'
];

$options = [
    'http' => [
        'header' => "Content-type: application/json\r\n",
        'method' => 'POST',
        'content' => json_encode($data)
    ]
];

$context = stream_context_create($options);
$response = file_get_contents('http://localhost:8000/api/cashiers', false, $context);
echo "Response: " . $response . "\n\n";

echo "API test completed!\n";
?>
