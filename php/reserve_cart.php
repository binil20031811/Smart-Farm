<?php
header('Content-Type: application/json');

// Database connection
$servername = "localhost";
$username = "root";
$password = ""; // Add your database password here
$dbname = "smartfarm";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

// Get the raw POST data
$data = json_decode(file_get_contents('php://input'), true);

// Check if data is correctly decoded
if (!$data) {
    die(json_encode(["error" => "Invalid input data"]));
}

// Ensure cart and totalPrice exist in the received data
if (!isset($data['cart']) || !isset($data['totalPrice'])) {
    die(json_encode(["error" => "Missing 'cart' or 'totalPrice' in input"]));
}

$cart = $data['cart'];
$totalPrice = $data['totalPrice'];

if (!is_array($cart) || !is_numeric($totalPrice)) {
    die(json_encode(["error" => "Invalid cart or totalPrice"]));
}

// Start a transaction
$conn->begin_transaction();

try {
    // Update product quantities in the database
    foreach ($cart as $item) {
        $productName = $item['name'];
        $quantity = $item['quantity'];

        // Fetch the current quantity from the database
        $stmt = $conn->prepare("SELECT quantity FROM products WHERE name = ?");
        $stmt->bind_param("s", $productName);
        $stmt->execute();
        $stmt->bind_result($currentQuantity);
        $stmt->fetch();
        $stmt->close();

        // Calculate the new quantity
        $newQuantity = $currentQuantity - $quantity;

        if ($newQuantity < 0) {
            throw new Exception("Insufficient stock for product: $productName");
        }

        // Update the product quantity in the database
        $stmt = $conn->prepare("UPDATE products SET quantity = ? WHERE name = ?");
        $stmt->bind_param("is", $newQuantity, $productName);
        $stmt->execute();
        $stmt->close();
    }

    // Insert the sale into the income table
    $date = date('Y-m-d H:i:s'); // Current date and time
    $type = 'sale';

    $stmt = $conn->prepare("INSERT INTO income (amount, date, type) VALUES (?, ?, ?)");
    $stmt->bind_param("dss", $totalPrice, $date, $type);
    $stmt->execute();
    $stmt->close();

    // Commit the transaction
    $conn->commit();

    echo json_encode(["success" => "Order placed successfully!"]);
} catch (Exception $e) {
    // Rollback the transaction in case of error
    $conn->rollback();
    echo json_encode(["error" => $e->getMessage()]);
}

$conn->close();

?>