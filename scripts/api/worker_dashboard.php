<?php
session_start();
include 'db_connection.php';

// Ensure the user is logged in
if (!isset($_SESSION['user_id']) || $_SESSION['usertype'] != 'worker') {
    header("Location: login.html");
    exit();
}

$user_id = $_SESSION['user_id'];

// Fetch worker details
$stmt = $conn->prepare("SELECT * FROM worker WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$worker = $result->fetch_assoc();

if (!$worker) {
    echo "Worker details not found.";
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Worker Dashboard</title>
    <link rel="stylesheet" href="styles/dashboard.css">
</head>
<body>
    <h2>Welcome, <?php echo htmlspecialchars($worker['name']); ?></h2>
    <p>Address: <?php echo htmlspecialchars($worker['address']); ?></p>
    <p>Date of Birth: <?php echo htmlspecialchars($worker['dob']); ?></p>
    <p>Section: <?php echo htmlspecialchars($worker['section']); ?></p>
    <p>Phone: <?php echo htmlspecialchars($worker['phone_number']); ?></p>
    <p>Salary: $<?php echo htmlspecialchars($worker['salary']); ?></p>
    <p>Hire Date: <?php echo htmlspecialchars($worker['hire_date']); ?></p>
    <a href="logout.php">Logout</a>
</body>
</html>
