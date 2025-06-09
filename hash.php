<?php
// Example password from user input
$password = '@Medic123';

// Hash the password using the PASSWORD_DEFAULT algorithm
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Output the hashed password (for demonstration purposes)
echo "Hashed Password: " . $hashedPassword;
?>