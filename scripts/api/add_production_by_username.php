<?php
header("Content-Type: application/json");

// Database configuration
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'smartfarm';

// Create connection
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

// Check connection
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'error' => 'Database connection failed']));
}

$data = json_decode(file_get_contents('php://input'), true);

try {
    if (empty($data['username'])) {
        throw new Exception('Username is required');
    }

    // Start transaction
    $conn->begin_transaction();

    // Get worker ID from username
    $stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->bind_param("s", $data['username']);
    $stmt->execute();
    $worker = $stmt->get_result()->fetch_assoc();
    
    if (!$worker) {
        throw new Exception('Worker not found');
    }

    // Insert production record
    $stmt = $conn->prepare("
        INSERT INTO production (worker_id, product_name, quantity, date, notes)
        VALUES (?, ?, ?, ?, ?)
    ");
    
    $stmt->bind_param(
        "sssds",
        $worker['id'],
        $data['product_name'],
        $data['quantity'],
        $data['date'],
        $data['notes']
    );
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to add production: ' . $stmt->error);
    }

    // Update product quantity
    $stmt = $conn->prepare("
        UPDATE products
        SET quantity = quantity + ? 
        WHERE name = ?
    ");
    $stmt->bind_param("ds", $data['quantity'], $data['product_name']);
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to update product quantity: ' . $stmt->error);
    }

    // Update attendance
    $stmt = $conn->prepare("
        INSERT INTO attendance (id, date, present)
        VALUES (?, ?, TRUE)
        ON DUPLICATE KEY UPDATE present = TRUE
    ");
    $stmt->bind_param("is", $worker['id'], $data['date']);
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to update attendance: ' . $stmt->error);
    }

    // Commit transaction if all operations succeeded
    $conn->commit();

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} finally {
    $conn->close();
}
?>