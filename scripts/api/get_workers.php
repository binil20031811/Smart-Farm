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

try {
    // Prepare and execute query
    $stmt = $conn->prepare("
        SELECT id, name, section, dob, salary, phone_number, address 
        FROM worker
        ORDER BY name
    ");
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    $workers = $result->fetch_all(MYSQLI_ASSOC);

    // Return success response
    echo json_encode([
        'success' => true,
        'data' => $workers
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch workers: ' . $e->getMessage()
    ]);
} finally {
    // Close connections
    if (isset($stmt)) $stmt->close();
    $conn->close();
}
?>