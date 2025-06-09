<?php
header("Content-Type: application/json");

try {
    session_start();
    
    // Verify session exists and is valid
    if (!isset($_SESSION['authenticated'])) {
        throw new Exception('Not authenticated', 401);
    }

    // Check session expiration (30 minutes)
    if (time() - $_SESSION['last_activity'] > 1800) {
        session_unset();
        session_destroy();
        throw new Exception('Session expired', 401);
    }

    // Update last activity time
    $_SESSION['last_activity'] = time();

    // Return session data
    echo json_encode([
        'authenticated' => true,
        'user_id' => $_SESSION['user_id'],
        'user_type' => $_SESSION['user_type'],
        'username' => $_SESSION['username'],
        'name' => $_SESSION['name'] ?? null
    ]);
    
} catch (Exception $e) {
    http_response_code($e->getCode() ?: 500);
    echo json_encode([
        'authenticated' => false,
        'error' => $e->getMessage()
    ]);
}
?>