<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");

// Database configuration
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "smartfarm";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

// Get all sections with details (no need to select weak as we'll calculate it)
$sql = "SELECT id, name, animal_type, no_of_animals, output, healthy 
        FROM section 
        ORDER BY name ASC";

$result = $conn->query($sql);

if (!$result) {
    die(json_encode(["error" => "Error fetching sections: " . $conn->error]));
}

$sections = [];
while ($row = $result->fetch_assoc()) {
    // Calculate weak animals
    $row['weak'] = $row['no_of_animals'] - $row['healthy'];
    $sections[] = $row;
}

echo json_encode($sections);

$conn->close();
?>