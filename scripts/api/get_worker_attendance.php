<?php
header("Content-Type: application/json");

// Database configuration
$dbConfig = [
    'host' => 'localhost',
    'user' => 'root',
    'pass' => '',
    'name' => 'smartfarm'
];

$conn = new mysqli($dbConfig['host'], $dbConfig['user'], $dbConfig['pass'], $dbConfig['name']);

if ($conn->connect_error) {
    die(json_encode(['error' => 'Database connection failed']));
}

try {
    $username = $conn->real_escape_string($_GET['username'] ?? '');
    
    if (empty($username)) {
        throw new Exception('Username is required');
    }

    // Get worker ID
    $stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $worker = $stmt->get_result()->fetch_assoc();
    
    if (!$worker) {
        throw new Exception('Worker not found');
    }

    // Get all attendance records for this worker (no date range filter)
    $stmt = $conn->prepare("
        SELECT DATE(date) as date, present 
        FROM attendance 
        WHERE id = ?
        ORDER BY date
    ");
    $stmt->bind_param("i", $worker['id']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $attendance = [];
    while ($row = $result->fetch_assoc()) {
        $attendance[] = [
            'date' => $row['date'],
            'present' => (bool)$row['present']
        ];
    }

    echo json_encode($attendance);

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
} finally {
    $conn->close();
}
?>