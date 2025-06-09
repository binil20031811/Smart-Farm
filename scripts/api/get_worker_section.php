<?php
header("Content-Type: application/json");
require_once '../config/database.php';

try {
    $workerId = intval($_GET['id'] ?? 0);
    
    if ($workerId <= 0) {
        throw new Exception('Invalid worker ID');
    }

    // Get worker's section and output product
    $stmt = $conn->prepare("
        SELECT w.section, s.output_product, s.section_name 
        FROM worker w
        JOIN section s ON w.section = s.id
        WHERE w.id = ?
    ");
    $stmt->bind_param("i", $workerId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception('Worker not found');
    }

    $data = $result->fetch_assoc();
    echo json_encode([
        'success' => true,
        'section_name' => $data['section_name'],
        'output_product' => $data['output_product']
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>