document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const userType = document.getElementById('user-type').value;
    const errorElement = document.getElementById('error-message');

    errorElement.innerText = '';

    if (!username || !password || !userType) {
        errorElement.innerText = 'Please fill all fields';
        return;
    }

    try {
        const response = await fetch('./scripts/api/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&user-type=${encodeURIComponent(userType)}`
        });

        const data = await response.json();

        if (data.success) {
            window.location.href = data.redirect;
        } else {
            errorElement.innerText = data.message || 'Login failed';
        }
    } catch (error) {
        console.error('Error:', error);
        errorElement.innerText = 'An error occurred during login';
    }
});

// Show signup option only for customers
document.getElementById('user-type').addEventListener('change', function() {
    const signupOption = document.getElementById('signup-option');
    if (this.value === 'customer') {
        signupOption.style.display = 'block';
    } else {
        signupOption.style.display = 'none';
    }
});

// Password visibility toggle
document.getElementById('togglePassword').addEventListener('click', function() {
    const passwordInput = document.getElementById('password');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    this.classList.toggle('fa-eye-slash');
});