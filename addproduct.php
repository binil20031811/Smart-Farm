<?php
// Database connection parameters
$host = 'localhost';
$dbname = 'smartfarm';
$username = 'root';
$password = '';

try {
    // Create a new PDO instance
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Get the JSON data from the request
    $data = json_decode(file_get_contents("php://input"));

    // Check if the product already exists
    $checkStmt = $pdo->prepare("SELECT COUNT(*) FROM products WHERE id = :id");
    $checkStmt->bindParam(':id', $data->productId);
    $checkStmt->execute();
    $productExists = $checkStmt->fetchColumn();

    if ($productExists > 0) {
        // Return error response for existing product
        echo json_encode(['success' => false, 'message' => 'Product with this ID already exists.']);
    } else {
        // Prepare and execute the insert statement for the products table
        $stmt = $pdo->prepare("INSERT INTO products (id, name, ptype, price, image_url) VALUES (:id, :name, :ptype, :price, :image_url)");
        $stmt->bindParam(':id', $data->productId);
        $stmt->bindParam(':name', $data->productName);
        $stmt->bindParam(':ptype', $data->productType);
        $stmt->bindParam(':price', $data->price);
        $stmt->bindParam(':image_url', $data->imageUrl);
        
        // Execute the statement
        $stmt->execute();

        // Check if the product was added successfully
        if ($stmt->rowCount() > 0) {
            // Sanitize product name for column name (remove spaces, special characters)
            $columnName = preg_replace('/[^a-zA-Z0-9_]/', '_', $data->productName);

            // Return success response
            echo json_encode(['success' => true, 'message' => 'Product added successfully, and production column created!']);
        } else {
            // Return error response
            echo json_encode(['success' => false, 'message' => 'Failed to add product.']);
        }
    }
} catch (PDOException $e) {
    // Return error response
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>