<?php
header("Content-Type: application/json");

// Database configuration
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'smartfarm';

// Create connection
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

// Check connection
if ($conn->connect_error) {
    http_response_code(500);
    die(json_encode([
        'success' => false,
        'error' => 'Database connection failed: ' . $conn->connect_error
    ]));
}

// Set charset
$conn->set_charset("utf8mb4");

// Get input data
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    die(json_encode([
        'success' => false,
        'error' => 'Invalid input data'
    ]));
}

// Validate required fields
$required_fields = ['id', 'name', 'section', 'dob', 'salary', 'phone_number', 'address'];
foreach ($required_fields as $field) {
    if (empty($input[$field])) {
        http_response_code(400);
        die(json_encode([
            'success' => false,
            'error' => "Missing required field: $field"
        ]));
    }
}

try {
    // Prepare update statement
    $stmt = $conn->prepare("
        UPDATE worker
        SET name = ?, section = ?, dob = ?, salary = ?, phone_number = ?, address = ?
        WHERE id = ?
    ");
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    // Bind parameters
    // In the binding parameters, change to use section_id instead of section name
$stmt->bind_param(
    "sssdssi",
    $input['name'],
    $input['section'], // This should now be the section ID
    $input['dob'],
    $input['salary'],
    $input['phone_number'],
    $input['address'],
    $input['id']
);
    
    if (!$bind_result) {
        throw new Exception("Bind failed: " . $stmt->error);
    }
    
    // Execute update
    $execute_result = $stmt->execute();
    
    if (!$execute_result) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    // Check if any rows were affected
    if ($stmt->affected_rows > 0) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'No changes made or worker not found'
        ]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
} finally {
    // Close connections
    if (isset($stmt)) $stmt->close();
    $conn->close();
}
?>