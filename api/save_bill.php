<?php
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$items = $data['items'];
$total = $data['total'];

// Database connection
$conn = new mysqli('localhost', 'root', '', 'smartfarm');
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Start a transaction to ensure atomicity
$conn->begin_transaction();

try {
    // Save bill
    $query = "INSERT INTO bills (items, total) VALUES (?, ?)";
    $stmt = $conn->prepare($query);
    $itemsJson = json_encode($items);
    $stmt->bind_param('sd', $itemsJson, $total);
    $stmt->execute();
    $billId = $stmt->insert_id; // Get the ID of the inserted bill
    $stmt->close();

    // Update product quantities
    foreach ($items as $item) {
        $productId = $item['id'];
        $quantity = $item['quantity'];

        // Fetch current quantity
        $query = "SELECT quantity FROM products WHERE id = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param('i', $productId);
        $stmt->execute();
        $stmt->bind_result($currentQuantity);
        $stmt->fetch();
        $stmt->close();

        // Calculate new quantity
        $newQuantity = $currentQuantity - $quantity;

        // Update product quantity
        $query = "UPDATE products SET quantity = ? WHERE id = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param('ii', $newQuantity, $productId);
        $stmt->execute();
        $stmt->close();
    }

    // Insert total bill amount into income table
    $query = "INSERT INTO income (bill_id, amount, type) VALUES (?, ?, ?)"; // Use ? for type
    $stmt = $conn->prepare($query);
    $type = "sale"; // Define the type value
    $stmt->bind_param('ids', $billId, $total, $type); // Bind the type value
    $stmt->execute();  
    $stmt->close();

    // Commit the transaction
    $conn->commit();

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    // Rollback the transaction in case of error
    $conn->rollback();
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

$conn->close();
?>