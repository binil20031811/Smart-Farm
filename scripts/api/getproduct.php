<?php
// Database connection
$host = 'localhost'; // Replace with your database host
$dbname = 'smartfarm'; // Replace with your database name
$username = 'root'; // Replace with your database username
$password = ''; // Replace with your database password

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $productId = $_GET['id'];

    // Fetch product details from the database
    $stmt = $conn->prepare("SELECT id, name, ptype, price, quantity FROM products WHERE id = :id");
    $stmt->execute(['id' => $productId]);
    $product = $stmt->fetch(PDO::FETCH_ASSOC);

    // Return data as JSON
    header('Content-Type: application/json');
    echo json_encode($product);
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>