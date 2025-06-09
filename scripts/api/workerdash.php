<?php
session_start();
include 'db_connection.php'; // Database connection

if (!isset($_SESSION['username']) || $_SESSION['usertype'] != 'worker') {
    header("Location: login.html"); // Redirect to login if not authenticated
    exit();
}

$username = $_SESSION['username'];

// Fetch worker details
$stmt = $conn->prepare("SELECT * FROM worker WHERE id = ?");
$stmt->bind_param("i", $_SESSION['id']);
$stmt->execute();
$result = $stmt->get_result();
$worker = $result->fetch_assoc();

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Worker Dashboard - SMART FARM</title>
    <link rel="stylesheet" href="./styles/workerdash.css">
</head>
<body>
    <h1>Welcome, <?php echo htmlspecialchars($worker['name']); ?>!</h1>
    <script>
        document.getElementById("workerName").textContent = "<?php echo addslashes($worker['name']); ?>";
        document.getElementById("workerId").textContent = "<?php echo addslashes($worker['id']); ?>";
        document.getElementById("workerSection").textContent = "<?php echo addslashes($worker['section']); ?>";
        document.getElementById("workerDob").textContent = "<?php echo addslashes($worker['dob']); ?>";
        document.getElementById("workerSalary").textContent = "<?php echo addslashes($worker['salary']); ?>";
        document.getElementById("workerPhone").textContent = "<?php echo addslashes($worker['phone_number']); ?>";
        document.getElementById("workerAddress").textContent = "<?php echo addslashes($worker['address']); ?>";
    </script>
</body>
</html>
