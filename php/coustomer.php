<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Set the response header to JSON
header('Content-Type: application/json');

// Database connection
$servername = "localhost";
$username = "root";
$password = ""; // Add your database password here
$dbname = "smartfarm";

$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

// Fetch products from the database
$sql = "SELECT * FROM products";
$result = $conn->query($sql);

if (!$result) {
    die(json_encode(["error" => "Error fetching products: " . $conn->error]));
}

$products = [];
while ($row = $result->fetch_assoc()) {
    $products[] = $row;
}

$conn->close();

// Return products as JSON
echo json_encode($products);
?>