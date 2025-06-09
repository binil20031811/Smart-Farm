<?php
// Database connection
$host = 'localhost'; // Replace with your database host
$dbname = 'smartfarm'; // Replace with your database name
$username = 'root'; // Replace with your database username
$password = ''; // Replace with your database password

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $data = json_decode(file_get_contents('php://input'), true);

    $stmt = $conn->prepare("UPDATE products SET name = :name, ptype = :ptype, price = :price, quantity = :quantity WHERE id = :id");
    $stmt->execute([
        'id' => $data['id'],
        'name' => $data['name'],
        'ptype' => $data['ptype'],
        'price' => $data['price'],
        'quantity' => $data['quantity']
    ]);

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>