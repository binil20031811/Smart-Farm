<?php
// Always return JSON
header('Content-Type: application/json');

// Basic error reporting - turn off HTML errors
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Database configuration
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "smartfarm";

try {
    // Create connection
    $conn = new mysqli($servername, $username, $password, $dbname);
    
    // Check connection
    if ($conn->connect_error) {
        throw new Exception("Database connection failed");
    }

    // Get POST data
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception("Invalid JSON input");
    }

    // Required fields
    $required = ['date', 'section_id', 'notes'];
    foreach ($required as $field) {
        if (empty($input[$field])) {
            throw new Exception("Missing required field: $field");
        }
    }

    // Insert reminder
    $stmt = $conn->prepare("INSERT INTO reminder (date, section, notes) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $input['date'], $input['section_id'], $input['notes']);
    
    if (!$stmt->execute()) {
        throw new Exception("Failed to save reminder");
    }

    // Success response
    echo json_encode([
        'success' => true,
        'message' => 'Reminder saved successfully'
    ]);

} catch (Exception $e) {
    // Error response
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
} finally {
    // Close connections
    if (isset($stmt)) $stmt->close();
    if (isset($conn)) $conn->close();
}
?>