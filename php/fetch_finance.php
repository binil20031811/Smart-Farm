<?php
header('Content-Type: application/json');

$fromDate = $_GET['fromDate'] ?? '';
$toDate = $_GET['toDate'] ?? '';

// Database connection
$conn = new mysqli("localhost", "root", "", "smartfarm");
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Fetch income data
$incomeQuery = "SELECT * FROM income";
if ($fromDate && $toDate) {
    $incomeQuery .= " WHERE date BETWEEN '$fromDate' AND '$toDate'";
}
$incomeResult = $conn->query($incomeQuery);
$incomeData = [];
while ($row = $incomeResult->fetch_assoc()) {
    $incomeData[] = $row;
}

// Fetch expense data
$expenseQuery = "SELECT * FROM expenses";
if ($fromDate && $toDate) {
    $expenseQuery .= " WHERE date BETWEEN '$fromDate' AND '$toDate'";
}
$expenseResult = $conn->query($expenseQuery);
$expenseData = [];
while ($row = $expenseResult->fetch_assoc()) {
    $expenseData[] = $row;
}

// Return JSON response
echo json_encode([
    'income' => $incomeData,
    'expense' => $expenseData
]);

$conn->close();
?>