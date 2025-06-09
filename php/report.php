<?php
header('Content-Type: application/json');

// Database connection
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "smartfarm";

try {
    // Create connection
    $conn = new mysqli($servername, $username, $password, $dbname);
    
    // Check connection
    if ($conn->connect_error) {
        throw new Exception("Database connection failed: " . $conn->connect_error);
    }

    // Get parameters
    $dataType = $_GET['dataType'] ?? 'production';
    $timeRange = $_GET['timeRange'] ?? 'all';

    // Validate data type
    if (!in_array($dataType, ['production', 'expense'])) {
        throw new Exception("Invalid data type requested");
    }

    if ($dataType === 'production') {
        // Production data query
        $sql = "SELECT date, quantity FROM production";
        
        // Apply time range filter
        if ($timeRange === 'week') {
            $sql .= " WHERE date >= DATE_SUB(CURDATE(), INTERVAL 1 WEEK)";
        } elseif ($timeRange === 'month') {
            $sql .= " WHERE date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)";
        }
        
        $sql .= " ORDER BY date ASC";
        
        $result = $conn->query($sql);
        
        if (!$result) {
            throw new Exception("Production query failed: " . $conn->error);
        }

        $responseData = [];
        while ($row = $result->fetch_assoc()) {
            $responseData[] = [
                'date' => $row['date'],
                'quantity' => (int)$row['quantity']
            ];
        }

    } else {
        // Expense data query
        $sql = "SELECT date, amount, type FROM expenses";
        
        // Apply time range filter
        if ($timeRange === 'week') {
            $sql .= " WHERE date >= DATE_SUB(CURDATE(), INTERVAL 1 WEEK)";
        } elseif ($timeRange === 'month') {
            $sql .= " WHERE date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)";
        }
        
        $sql .= " ORDER BY date ASC";
        
        $result = $conn->query($sql);
        
        if (!$result) {
            throw new Exception("Expense query failed: " . $conn->error);
        }

        $responseData = [];
        while ($row = $result->fetch_assoc()) {
            $responseData[] = [
                'date' => $row['date'],
                'amount' => (float)$row['amount'],
                'category' => $row['type']
            ];
        }
    }

    // Return successful response
    echo json_encode([
        'success' => true,
        'data' => $responseData
    ]);

} catch (Exception $e) {
    // Return error response
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
} finally {
    // Close connection if it exists
    if (isset($conn)) {
        $conn->close();
    }
}
?>