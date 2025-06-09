<?php
header('Content-Type: application/json');

$search = $_GET['search'] ?? '';

// Database connection
$conn = new mysqli('localhost', 'root', '', 'smartfarm');
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Fetch products
if (empty($search)) {
    $query = "SELECT * FROM products";
    $stmt = $conn->prepare($query);
} else {
    $query = "SELECT * FROM products WHERE name LIKE ?";
    $stmt = $conn->prepare($query);
    $searchTerm = "%$search%";
    $stmt->bind_param('s', $searchTerm);
}
$stmt->execute();
$result = $stmt->get_result();

$products = [];
while ($row = $result->fetch_assoc()) {
    $products[] = $row;
}

echo json_encode($products);

$stmt->close();
$conn->close();
?>