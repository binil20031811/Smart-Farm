<?php
header("Content-Type: application/json");
require_once '../config/database.php';

$data = json_decode(file_get_contents('php://input'), true);

try {
    // Get worker ID from username
    $stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->bind_param("s", $data['username']);
    $stmt->execute();
    $worker = $stmt->get_result()->fetch_assoc();
    
    if (!$worker) throw new Exception('Worker not found');

    // Insert production record
    $stmt = $conn->prepare("
        INSERT INTO production (worker_id, product_name, quantity, date, notes)
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->bind_param(
        "sdsss",
        $worker['id'],
        $data['product_name'],
        $data['quantity'],
        $data['date'],
        $data['notes']
    );
    $stmt->execute();

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>