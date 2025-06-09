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

// Get dates
$today = date('Y-m-d');
$tomorrow = date('Y-m-d', strtotime('+1 day'));

// Get upcoming reminders (today and tomorrow)
$sql_upcoming = "SELECT r.id, r.date, r.notes, s.id as section_name 
                FROM reminder r
                JOIN section s ON r.section = s.id
                WHERE r.date BETWEEN ? AND ?
                ORDER BY r.date ASC";

// Get past reminders (before today)
$sql_past = "SELECT r.id, r.date, r.notes, s.id as section_name 
             FROM reminder r
             JOIN section s ON r.section = s.id
             WHERE r.date < ?
             ORDER BY r.date DESC
             LIMIT 10";

$result = ['upcoming' => [], 'past' => []];

// Get upcoming reminders
$stmt = $conn->prepare($sql_upcoming);
$stmt->bind_param("ss", $today, $tomorrow);
$stmt->execute();
$result['upcoming'] = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

// Get past reminders
$stmt = $conn->prepare($sql_past);
$stmt->bind_param("s", $today);
$stmt->execute();
$result['past'] = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

echo json_encode($result);
$conn->close();
?>