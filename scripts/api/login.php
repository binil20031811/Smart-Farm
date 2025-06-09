<?php
session_start();
header('Content-Type: application/json');

// Database connection
$host = "localhost";
$user = "root";
$password = "";
$database = "smartfarm";

$conn = new mysqli($host, $user, $password, $database);

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Database connection failed!"]));
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($username) || empty($password)) {
        echo json_encode(["success" => false, "message" => "Username and password are required"]);
        exit;
    }

    $stmt = $conn->prepare("SELECT id, username, password, user_type FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows == 1) {
        $row = $result->fetch_assoc();

        if (password_verify($password, $row['password'])) {
            $_SESSION['username'] = $row['username'];
            $_SESSION['usertype'] = $row['user_type'];
            $_SESSION['id'] = $row['id'];

            $redirectPages = [
                'admin' => 'admindash.html',
                'worker' => 'workerdash.html?username=' . urlencode($row['username']),
                'cashier' => 'cashierdash.html',
                'customer' => 'customerdash.html',
                'medic' => 'medicdash.html'
            ];

            $redirect = $redirectPages[$row['user_type']] ?? 'login.html';
            echo json_encode(["success" => true, "redirect" => $redirect]);
        } else {
            echo json_encode(["success" => false, "message" => "Invalid credentials!"]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "User not found!"]);
    }

    $stmt->close();
}

$conn->close();
?>