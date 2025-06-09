document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const workersTable = document.getElementById('workersTable');
    const yearSelect = document.getElementById('year');
    const monthSelect = document.getElementById('month');
    const resultContainer = document.getElementById('resultContainer');
    const errorMessage = document.getElementById('error-message');
    const confirmSaveBtn = document.getElementById('confirmSave');
    
    // Current selected worker and period
    let currentWorker = null;
    let currentYear = yearSelect.value;
    let currentMonth = monthSelect.value;
    
    // Load workers data
    function loadWorkers() {
        fetch('scripts/api/get__workers.php')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    renderWorkersTable(data.workers);
                } else {
                    showError(data.error || 'Failed to load workers');
                }
            })
            .catch(error => {
                showError('Network error: ' + error.message);
            });
    }
    
    function renderWorkersTable(workers) {
        const tbody = workersTable.querySelector('tbody');
        tbody.innerHTML = ''; // Clear existing rows
    
        workers.forEach(worker => {
            // Ensure salary is a number
            const salary = parseFloat(worker.salary) || 0; // Convert to number, default to 0 if invalid
    
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${worker.id}</td>
                <td>${worker.name}</td>
                <td>₹${salary.toFixed(2)}</td> 
                <td>
                    <button class="action-btn calculate-btn" data-worker-id="${worker.id}">
                        Calculate Salary
                    </button>
                    <button class="action-btn save-btn" disabled data-worker-id="${worker.id}">
                        Save as Expense
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    
        // Add event listeners to buttons
        document.querySelectorAll('.calculate-btn').forEach(btn => {
            btn.addEventListener('click', calculateSalary);
        });
    
        document.querySelectorAll('.save-btn').forEach(btn => {
            btn.addEventListener('click', saveSalary);
        });
    }
    
    
    function loadWorkers() {
        fetch('scripts/api/get__workers.php')
            .then(response => response.json())
            .then(data => {
                console.log("API Response:", data); // Debugging log
                if (data.success && Array.isArray(data.data)) {
                    renderWorkersTable(data.data); // Use `data.data`
                } else {
                    showError(data.error || 'Failed to load workers');
                }
            })
            
    
            .catch(error => {
                showError('Network error: ' + error.message);
                console.error("Fetch Error:", error);
            });
    }
    
    
    // Calculate salary for a worker
    function calculateSalary(e) {
        const workerId = e.target.getAttribute('data-worker-id');
        currentYear = yearSelect.value;
        currentMonth = monthSelect.value;
        
        fetch(`scripts/api/calculate_salary.php?worker_id=${workerId}&year=${currentYear}&month=${currentMonth}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    currentWorker = data;
                    displayResult(data);
                    // Enable save button for this worker
                    document.querySelector(`.save-btn[data-worker-id="${workerId}"]`).disabled = false;
                } else {
                    showError(data.error || 'Failed to calculate salary');
                }
            })
            .catch(error => {
                showError('Network error: ' + error.message);
            });
    }
    
    // Display calculation result
    function displayResult(data) {
        document.getElementById('resultWorkerName').textContent = data.worker_name;
        document.getElementById('resultPeriod').textContent = 
            `${new Date(data.year, data.month - 1).toLocaleString('default', { month: 'long' })} ${data.year}`;
        document.getElementById('resultDailySalary').textContent = `₹${data.daily_salary.toFixed(2)}`;
        document.getElementById('resultDaysPresent').textContent = data.days_present;
        document.getElementById('resultMonthlySalary').textContent = `₹${data.monthly_salary.toFixed(2)}`;
        
        resultContainer.style.display = 'block';
    }
    
    // Save salary to expenses
    function saveSalary(e) {
        if (!currentWorker) return;
        
        const formData = new FormData();
        formData.append('worker_id', currentWorker.worker_id);
        formData.append('worker_name', currentWorker.worker_name);
        formData.append('amount', currentWorker.monthly_salary);
        formData.append('year', currentYear);
        formData.append('month', currentMonth);
        
        fetch('api/save_salary.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Salary saved to expenses successfully!');
                // Disable save button after saving
                document.querySelector(`.save-btn[data-worker-id="${currentWorker.worker_id}"]`).disabled = true;
                resultContainer.style.display = 'none';
            } else {
                showError(data.error || 'Failed to save salary');
            }
        })
        .catch(error => {
            showError('Network error: ' + error.message);
        });
    }
    
    // Confirm and save button handler
    confirmSaveBtn.addEventListener('click', function() {
        if (currentWorker) {
            const saveBtn = document.querySelector(`.save-btn[data-worker-id="${currentWorker.worker_id}"]`);
            if (saveBtn) {
                saveBtn.click();
            }
        }
    });
    
    // Show error message
    function showError(message) {
        errorMessage.textContent = message;
        setTimeout(() => {
            errorMessage.textContent = '';
        }, 5000);
    }
    
    // Initialize the page
    loadWorkers();
});