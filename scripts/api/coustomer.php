<?php
header('Content-Type: application/json');

error_reporting(E_ALL);
ini_set('display_errors', 1);

// *Connect to MariaDB*
$con = mysqli_connect('localhost', 'root', '', 'smartfarm');

// Check for connection errors
if (!$con) {
    die(json_encode(["error" => "Connection failed: " . mysqli_connect_error()]));
}

// Define the SQL query
$sql = "SELECT id, name, ptype, price, image_url FROM products";

// Execute the query
$result = $con->query($sql);

// Check if the query was successful
if ($result === false) {
    // Handle query error
    echo json_encode(["error" => "Query failed: " . $con->error]);
    $con->close(); // Close the connection
    exit; // Exit the script
}

$products = [];

// Check if there are any rows returned
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $products[] = $row;
    }
}

// Return the products as JSON
echo json_encode($products);

// Close the connection
$con->close();
?>