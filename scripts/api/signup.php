<?php
header('Content-Type: application/json');

$host = "localhost";
$user = "root";
$password = "";
$database = "smartfarm";

$conn = new mysqli($host, $user, $password, $database);

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Database connection failed"]));
}

$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['username']) || empty($data['password'])) {
    echo json_encode(["success" => false, "message" => "Username and password are required"]);
    exit;
}

// Check if username already exists
$stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
$stmt->bind_param("s", $data['username']);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Username already exists"]);
    exit;
}
$stmt->close();

// Hash password and insert new customer
$hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
$stmt = $conn->prepare("INSERT INTO users (username, password, user_type) VALUES (?, ?, 'customer')");
$stmt->bind_param("ss", $data['username'], $hashedPassword);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Registration successful"]);
} else {
    echo json_encode(["success" => false, "message" => "Registration failed"]);
}

$stmt->close();
$conn->close();
?>