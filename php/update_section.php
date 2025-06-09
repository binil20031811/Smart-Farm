<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

// Database configuration
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "smartfarm";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(["success" => false, "error" => "Connection failed: " . $conn->connect_error]));
}

// Get the raw POST data
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Validate input
if (!isset($data['id']) || !isset($data['healthy'])) {
    echo json_encode(["success" => false, "error" => "Missing required fields"]);
    exit;
}

// Sanitize input - don't convert id to int if it's a string in DB
$id = $data['id']; // Keep as string
$healthy = intval($data['healthy']);

// Debug output (remove in production)
error_log("Updating section. ID: " . $id . ", Healthy: " . $healthy);

// Update the section - use "s" for string ID
$stmt = $conn->prepare("UPDATE section SET healthy = ? WHERE id = ?");
if ($stmt === false) {
    echo json_encode(["success" => false, "error" => "Prepare failed: " . $conn->error]);
    exit;
}

$stmt->bind_param("is", $healthy, $id); // "i" for integer, "s" for string

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(["success" => true, "message" => "Update successful"]);
    } else {
        echo json_encode(["success" => false, "error" => "No rows affected - ID may not exist"]);
    }
} else {
    echo json_encode(["success" => false, "error" => "Execute failed: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>