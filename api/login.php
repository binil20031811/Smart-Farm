<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database connection parameters
$servername = "localhost"; // Change if necessary
$username = "root"; // Your database username
$password = ""; // Your database password
$dbname = "smartfarm"; // Your database name

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Database connection failed: ' . $conn->connect_error]));
}

// Get the JSON data from the request
$input = file_get_contents("php://input");
$data = json_decode($input);

// Check if JSON decoding was successful
if (json_last_error() !== JSON_ERROR_NONE) {
    die(json_encode(['success' => false, 'message' => 'Invalid JSON input.']));
}

// Validate required fields
if (empty($data->username) || empty($data->password) || empty($data->userType)) {
    die(json_encode(['success' => false, 'message' => 'Missing required fields.']));
}

// Prepare the SQL statement
$sql = "SELECT * FROM users WHERE username = ? AND user_type = ?";
$stmt = $conn->prepare($sql);

// Check if the statement was prepared successfully
if (!$stmt) {
    die(json_encode(['success' => false, 'message' => 'Prepare statement failed: ' . $conn->error]));
}

// Bind parameters
$stmt->bind_param("ss", $data->username, $data->userType);

// Execute the statement
if (!$stmt->execute()) {
    die(json_encode(['success' => false, 'message' => 'Execute statement failed: ' . $stmt->error]));
}

$result = $stmt->get_result();

// Check if a user was found
if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    // Verify the password (assuming passwords are hashed in the database)
    if (password_verify($data->password, $user['password'])) {
        // User found, login successful
        echo json_encode(['success' => true]);
    } else {
        // Invalid password
        echo json_encode(['success' => false, 'message' => 'Invalid username or password.']);
    }
} else {
    // User not found
    echo json_encode(['success' => false, 'message' => 'Invalid username or password.']);
}

// Close the statement and connection
$stmt->close();
$conn->close();
?>
