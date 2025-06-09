document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("add-worker-form");
    const messageDiv = document.getElementById("message");
    const sectionSelect = document.getElementById("worker-section");

    // Password visibility toggle
document.getElementById('togglePassword').addEventListener('click', function() {
    const passwordInput = document.getElementById('worker-password');
    const icon = this;
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
});

    // Fetch sections from database
    fetchSections();

    // Auto-calculate age when DOB changes
    document.getElementById("worker-dob").addEventListener("change", function() {
        const dob = new Date(this.value);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        
        document.getElementById("worker-age").value = age;
    });

    form.addEventListener("submit", function(event) {
        event.preventDefault();
        
        // Get form values
        const workerId = document.getElementById("worker-id").value.trim();
        const username = document.getElementById("worker-username").value.trim();
        const password = document.getElementById("worker-password").value;
        const name = document.getElementById("worker-name").value.trim();
        const dob = document.getElementById("worker-dob").value;
        const sectionId = sectionSelect.value;
        const sectionName = sectionSelect.options[sectionSelect.selectedIndex].text.split(' - ')[1];
        const age = document.getElementById("worker-age").value;
        const salary = document.getElementById("worker-salary").value;
        const phone = document.getElementById("worker-phone").value.trim();
        const address = document.getElementById("worker-address").value.trim();

        // Validation
        if (!workerId || !username || !password || !name || !dob || !sectionId || !age || !salary || !phone || !address) {
            showMessage("Please fill in all fields", "error");
            return;
        }

        if (!validatePassword(password)) {
            showMessage("Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number", "error");
            return;
        }

        if (phone.length !== 10 || !/^\d+$/.test(phone)) {
            showMessage("Please enter a valid 10-digit phone number", "error");
            return;
        }

        if (age < 18) {
            showMessage("Worker must be at least 18 years old", "error");
            return;
        }

        // Prepare data for submission
        const workerData = {
            workerId,
            username,
            password,
            name,
            dob,
            sectionId,
            sectionName,
            age,
            salary,
            phone,
            address
        };

        // Submit to server (example)
        submitWorkerData(workerData);
    });

    function validatePassword(password) {
        // More flexible password validation
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return regex.test(password);
    }

    function fetchSections() {
        fetch('./php/get_sections.php')
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                if (data.error) {
                    showMessage(data.error, "error");
                    return;
                }
                populateSectionDropdown(data);
            })
            .catch(error => {
                console.error('Error fetching sections:', error);
                showMessage("Failed to load sections. Please try again.", "error");
            });
    }

    function populateSectionDropdown(sections) {
        sectionSelect.innerHTML = '<option value="">Select Section</option>';
        
        sections.forEach(section => {
            const option = document.createElement('option');
            option.value = section.id;
            option.textContent = `${section.id} - ${section.name}`;
            sectionSelect.appendChild(option);
        });
    }

    function submitWorkerData(data) {
        fetch('./php/add_worker.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw err; });
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                showMessage(data.error, "error");
            } else {
                showMessage(data.success, "success");
                form.reset();
                // Optionally redirect after successful submission
                window.location.href = 'workers.html';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            const errorMsg = error.error || "Failed to add worker. Please try again.";
            showMessage(errorMsg, "error");
        });
    }
    
    // Update your form event listener to use this function
    form.addEventListener("submit", function(event) {
        event.preventDefault();
        
        // Get form values
        const formData = {
            workerId: document.getElementById("worker-id").value.trim(),
            username: document.getElementById("worker-username").value.trim(),
            password: document.getElementById("worker-password").value,
            name: document.getElementById("worker-name").value.trim(),
            dob: document.getElementById("worker-dob").value,
            section: document.getElementById("worker-section").value,
            age: document.getElementById("worker-age").value,
            salary: document.getElementById("worker-salary").value,
            phone: document.getElementById("worker-phone").value.trim(),
            address: document.getElementById("worker-address").value.trim()
        };
    
        // Clear previous messages
        messageDiv.textContent = '';
        messageDiv.className = '';
        messageDiv.style.display = 'none';
    
        // Validation
        if (!formData.workerId || !formData.username || !formData.password || 
            !formData.name || !formData.dob || !formData.section || 
            !formData.age || !formData.salary || !formData.phone || !formData.address) {
            showMessage("Please fill in all fields", "error");
            return;
        }
    
        if (!validatePassword(formData.password)) {
            showMessage("Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number", "error");
            return;
        }
    
        if (formData.phone.length !== 10 || !/^\d+$/.test(formData.phone)) {
            showMessage("Please enter a valid 10-digit phone number", "error");
            return;
        }
    
        if (formData.age < 18) {
            showMessage("Worker must be at least 18 years old", "error");
            return;
        }
    
        // Submit to server
        submitWorkerData(formData);
    });

    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = type;
        messageDiv.style.display = "block";
        
        setTimeout(() => {
            messageDiv.style.display = "none";
        }, 3000);
    }
});