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
    die(json_encode(['error' => 'Database connection failed: ' . $conn->connect_error]));
}

$username = $conn->real_escape_string($_GET['username'] ?? '');

try {
    if (empty($username)) {
        throw new Exception('Username is required');
    }

    $stmt = $conn->prepare("
        SELECT w.section, s.output
        FROM worker w
        JOIN users u ON w.id = u.id
        JOIN section s ON w.section = s.id
        WHERE u.username = ?
    ");
    
    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }
    
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception('Worker not found');
    }

    echo json_encode($result->fetch_assoc());

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
} finally {
    $conn->close();
}
?>