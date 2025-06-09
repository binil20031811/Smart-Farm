document.getElementById('signup-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const messageElement = document.getElementById('message');

    // Clear previous messages
    messageElement.textContent = '';
    messageElement.className = 'error-message';

    // Validation
    if (password !== confirmPassword) {
        showMessage("Passwords don't match", 'error');
        return;
    }

    if (password.length < 8) {
        showMessage("Password must be at least 8 characters", 'error');
        return;
    }

    try {
        const response = await fetch('./scripts/api/signup.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                password,
                usertype: 'customer' // Fixed as customer
            })
        });

        const data = await response.json();

        if (data.success) {
            showMessage("Registration successful! Redirecting to login...", 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            showMessage(data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('An error occurred during registration', 'error');
    }
});

// Password visibility toggles
document.getElementById('togglePassword').addEventListener('click', function() {
    togglePasswordVisibility('password', this);
});

document.getElementById('toggleConfirmPassword').addEventListener('click', function() {
    togglePasswordVisibility('confirm-password', this);
});

function togglePasswordVisibility(fieldId, icon) {
    const field = document.getElementById(fieldId);
    const type = field.getAttribute('type') === 'password' ? 'text' : 'password';
    field.setAttribute('type', type);
    icon.classList.toggle('fa-eye-slash');
}

function showMessage(message, type) {
    const messageElement = document.getElementById('message');
    messageElement.textContent = message;
    messageElement.className = type === 'error' ? 'error-message' : 'success-message';
}