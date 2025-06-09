<?php
header("Content-Type: application/json");
require_once '../config/database.php';

$username = $_GET['username'] ?? '';

try {
    $stmt = $conn->prepare("
        SELECT w.section, s.output_product, s.section_name 
        FROM worker w
        JOIN users u ON w.id = u.id
        JOIN section s ON w.section = s.id
        WHERE u.username = ?
    ");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception('Worker not found');
    }

    echo json_encode($result->fetch_assoc());

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>