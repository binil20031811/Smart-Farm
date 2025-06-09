<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $type = $_POST['type']; // 'income' or 'expense'
    $amount = $_POST['amount'];
    $date = $_POST['date'];
    $description = $_POST['category'];

    $conn = new mysqli("localhost", "root", "", "smartfarm");
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    if ($type == 'income') {
        $stmt = $conn->prepare("INSERT INTO income (date, amount, type) VALUES (?, ?, ?)");
        $stmt->bind_param("sds", $date, $amount, $description);
    } else {
        $stmt = $conn->prepare("INSERT INTO expenses (amount, type, date) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $amount, $description, $date);
    }

    $stmt->execute();
    $stmt->close();
    $conn->close();

    header("Location: ../finance.html"); // Redirect back to dashboard
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Add Finance - SMART FARM</title>
    <link rel="stylesheet" href="../styles/add_finance.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" rel="stylesheet"/>
</head>
<body>
    <header class="header">
        <div class="contact-info">
            <span>contact@smartfarm.com</span> | <span>+91 1234567890</span>
        </div>
        <div class="social-icons">
            <a href="https://www.facebook.com" target="_blank"><i class="fab fa-facebook-f"></i></a>
            <a href="https://www.twitter.com" target="_blank"><i class="fab fa-twitter"></i></a>
            <a href="https://www.instagram.com" target="_blank"><i class="fab fa-instagram"></i></a>
        </div>
    </header>
    <nav class="navbar">
        <div class="logo">SMART FARM<span>.</span></div>
        <div class="nav-links">
            <a href="#">Home</a>
            <a href="#">About</a>
            <a href="#">Contact</a>
        </div>
    </nav>

    <div class="content">
        <div class="form-container">
            <h2>Add Income/Expense</h2>
            <form method="POST">
                <div class="form-group">
                    <label for="type">Type:</label>
                    <select id="type" name="type" required>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="amount">Amount:</label>
                    <input type="number" id="amount" name="amount" placeholder="Enter Amount" required>
                </div>
                <div class="form-group">
                    <label for="date">Date:</label>
                    <input type="date" id="date" name="date" required>
                </div>
                <div class="form-group">
                    <label for="category">Type:</label>
                    <input type="text" id="category" name="category" placeholder="Enter Type" required>
                </div>
                <button type="submit" id="submit">Submit</button>
            </form>
            <!-- Error message display -->
            <div id="error-message" class="error-message"></div>
        </div>
    </div>

    <footer>
        <p>&copy; 2023 SMART FARM. All rights reserved.</p>
    </footer>
</body>
</html>