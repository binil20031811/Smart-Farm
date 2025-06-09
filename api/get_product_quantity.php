<?php
header('Content-Type: application/json');

$productId = $_GET['id'];

// Database connection
$conn = new mysqli('localhost', 'root', '', 'smartfarm');
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Fetch product quantity
$query = "SELECT quantity FROM products WHERE id = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param('i', $productId);
$stmt->execute();
$stmt->bind_result($quantity);
$stmt->fetch();
$stmt->close();

echo json_encode(['quantity' => $quantity]);

$conn->close();
?>