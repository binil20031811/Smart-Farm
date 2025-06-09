<?php
header("Content-Type: application/json");

// Enable error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Database configuration
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'smartfarm';

// Connect to database
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    die(json_encode(['error' => 'Database connection failed']));
}

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    die(json_encode(['error' => 'Invalid input data']));
}

// Validate required fields
$required_fields = ['workerId', 'username', 'password', 'name', 'dob', 'section', 'age', 'salary', 'phone', 'address'];
foreach ($required_fields as $field) {
    if (empty($data[$field])) {
        http_response_code(400);
        die(json_encode(['error' => "Missing required field: $field"]));
    }
}

// Validate worker ID is numeric
if (!is_numeric($data['workerId'])) {
    die(json_encode(['error' => 'Worker ID must be a number']));
}

try {
    $conn->begin_transaction();
    
    // Hash password
    $hashed_password = password_hash($data['password'], PASSWORD_DEFAULT);
    
    // Insert into users table with ID
    $user_sql = "INSERT INTO users (id, username, password, user_type) VALUES (?, ?, ?, 'worker')";
    $user_stmt = $conn->prepare($user_sql);
    
    if (!$user_stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    // Bind parameters - notice we're including the ID first
    $bind_result = $user_stmt->bind_param("iss", 
        $data['workerId'],  // The ID (integer)
        $data['username'],  // The username (string)
        $hashed_password    // The password (string)
    );
    
    if (!$bind_result) {
        throw new Exception("Bind failed: " . $user_stmt->error);
    }
    
    if (!$user_stmt->execute()) {
        // Check for duplicate entry error
        if ($conn->errno == 1062) {
            throw new Exception("Username or Worker ID already exists");
        }
        throw new Exception("Execute failed: " . $user_stmt->error);
    }
    
    $user_id = $data['workerId']; // We're using workerId as user_id
    $user_stmt->close();
    
    // Insert into workers table
    $worker_sql = "INSERT INTO worker
                  (id,  name, address, dob, section, phone_number, salary,username, hire_date) 
                  VALUES (?, ?, ?, ?, ?, ?, ?,?, CURDATE())";
    
    $worker_stmt = $conn->prepare($worker_sql);
    if (!$worker_stmt) {
        throw new Exception("Worker prepare failed: " . $conn->error);
    }
    
    $worker_stmt->bind_param(
        "issssssd",
        $data['workerId'],  // Same ID as users table
        $data['name'],
        $data['address'],
        $data['dob'],
        $data['section'],
        $data['phone'],
        $data['salary'],
        $data['username']
    );
    
    if (!$worker_stmt->execute()) {
        throw new Exception("Worker insert failed: " . $worker_stmt->error);
    }
    
    $worker_stmt->close();
    $conn->commit();
    
    echo json_encode(['success' => 'Worker added successfully']);
    
} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

$conn->close();
?>