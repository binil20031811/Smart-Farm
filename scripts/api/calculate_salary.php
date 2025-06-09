<?php
header('Content-Type: application/json');

// Database connection settings
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'smartfarm';

// Create connection
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
if ($conn->connect_error) {
    http_response_code(500);
    die(json_encode(['success' => false, 'error' => 'Database connection failed: ' . $conn->connect_error]));
}

// Ensure data is UTF-8 encoded
$conn->set_charset("utf8mb4");

// Get parameters
$workerId = isset($_GET['worker_id']) ? intval($_GET['worker_id']) : 0;
$year = isset($_GET['year']) ? intval($_GET['year']) : date("Y");
$month = isset($_GET['month']) ? intval($_GET['month']) : date("m");

// Validate parameters
if ($workerId <= 0 || $year < 2000 || $month < 1 || $month > 12) {
    echo json_encode(['success' => false, 'error' => 'Invalid parameters']);
    exit;
}

try {
    // Get worker's salary from database
    $stmt = $conn->prepare("SELECT name, salary FROM worker WHERE id = ?");
    $stmt->bind_param("i", $workerId);
    $stmt->execute();
    $worker = $stmt->get_result()->fetch_assoc();
    
    if (!$worker) {
        echo json_encode(['success' => false, 'error' => 'Worker not found']);
        exit;
    }

    $workerName = $worker['name'];
    $dailySalary = round($worker['salary'], 2); // Assuming 30-day month

    // Count days present (assuming attendance table has `worker_id`, `date`)
    $stmt = $conn->prepare("
        SELECT COUNT(*) AS present 
        FROM attendance 
        WHERE id = ? AND YEAR(date) = ? AND MONTH(date) = ?
    ");
    $stmt->bind_param("iii", $workerId, $year, $month);
    $stmt->execute();
    $attendance = $stmt->get_result()->fetch_assoc();
    
    $daysPresent = $attendance['days_present'] ?? 0;
    $monthlySalary = round($dailySalary * $daysPresent, 2);

    // Return the calculated salary
    echo json_encode([
        'success' => true,
        'worker_id' => $workerId,
        'worker_name' => $workerName,
        'year' => $year,
        'month' => $month,
        'daily_salary' => $dailySalary,
        'days_present' => $daysPresent,
        'monthly_salary' => $monthlySalary
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error: ' . $e->getMessage()]);
} finally {
    if (isset($stmt)) $stmt->close();
    $conn->close();
}
?>
