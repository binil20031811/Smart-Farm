<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");

// Database connection
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "smartfarm";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

// Fetch sections from database
$sql = "SELECT id, name FROM section ORDER BY id";
$result = $conn->query($sql);

if (!$result) {
    die(json_encode(["error" => "Error fetching sections: " . $conn->error]));
}

$sections = [];
while ($row = $result->fetch_assoc()) {
    $sections[] = [
        'id' => $row['id'],
        'name' => $row['name']
    ];
}

$conn->close();

echo json_encode($sections);
?>