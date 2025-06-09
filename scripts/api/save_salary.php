<?php
header('Content-Type: application/json');
// Process salary saving to expenses
$workerId = $_POST['worker_id'];
$workerName = $_POST['worker_name'];
$amount = $_POST['amount'];
$year = $_POST['year'];
$month = $_POST['month'];

// In a real application, you would:
// 1. Insert into expenses table
// 2. Return success/failure

echo json_encode(['success' => true]);
?>