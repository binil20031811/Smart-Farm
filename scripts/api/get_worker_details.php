<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database connection parameters
$host = 'localhost'; // Database host
$db = 'smartfarm'; // Database name
$user = 'root'; // Database username
$pass = ''; // Database password

// Create a connection
$conn = new mysqli($host, $user, $pass, $db);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get the username from the request
$username = isset($_GET['username']) ? $conn->real_escape_string($_GET['username']) : '';

// Prepare and execute the SQL query
$sql = "SELECT * FROM worker WHERE username = '$username'";
$result = $conn->query($sql);

// Check if the worker exists
if ($result->num_rows > 0) {
    // Fetch the worker details
    $worker = $result->fetch_assoc();
    echo json_encode($worker); // Return the worker details as JSON
} else {
    echo json_encode(['error' => 'Worker not found']);
}

// Close the connection
$conn->close();
?>