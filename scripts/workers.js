document.addEventListener("DOMContentLoaded", function() {
    // DOM Elements
    const workerTable = document.getElementById('worker-list').getElementsByTagName('tbody')[0];
    const searchInput = document.getElementById('search-input');
    const editModal = document.getElementById('edit-modal');
    const closeBtn = document.querySelector('.close');
    const editForm = document.getElementById('edit-worker-form');
    
    // Current list of workers
    let currentWorkers = [];

    // Fetch workers from database
    async function fetchWorkers() {
        try {
            const response = await fetch('./scripts/api/get_workers.php');
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to load workers');
            }
            
            currentWorkers = data.data;
            return currentWorkers;
        } catch (error) {
            console.error('Error fetching workers:', error);
            showError('Failed to load worker data');
            return [];
        }
    }

    // Populate the worker table
    async function populateWorkerTable(filterText = '') {
        try {
            const workers = await fetchWorkers();
            workerTable.innerHTML = '';
            
            const filteredWorkers = filterText ? 
                workers.filter(worker => 
                    worker.name.toLowerCase().includes(filterText.toLowerCase()) ||
                    worker.section.toLowerCase().includes(filterText.toLowerCase()) ||
                    worker.id.toString().includes(filterText) ||
                    (worker.phone_number && worker.phone_number.includes(filterText))
                ) : workers;
            
            filteredWorkers.forEach(worker => {
                const row = document.createElement('tr');
                
                // Format date for display
                const dobDate = new Date(worker.dob);
                const formattedDob = dobDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
                
                // Format salary with commas
                const formattedSalary = new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    minimumFractionDigits: 0
                }).format(worker.salary);
                
                row.innerHTML = `
                    <td>${worker.id}</td>
                    <td>${worker.name}</td>
                    <td>${worker.section}</td>
                    <td>${formattedDob}</td>
                    <td>${formattedSalary}</td>
                    <td class="actions">
                        <button class="edit-btn" data-id="${worker.id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                    </td>
                `;
                workerTable.appendChild(row);
            });
            
            // Add event listeners to edit buttons
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const workerId = parseInt(this.getAttribute('data-id'));
                    const worker = currentWorkers.find(w => w.id === workerId);
                    if (worker) openEditModal(worker);
                });
            });
            
        } catch (error) {
            console.error('Error populating table:', error);
            showError('Failed to display worker data');
        }
    }

    // Open edit modal with all worker data
    function openEditModal(worker) {
        document.getElementById('worker-id').value = worker.id;
        document.getElementById('name').value = worker.name;
        document.getElementById('section').value = worker.section;
        document.getElementById('dob').value = worker.dob;
        document.getElementById('salary').value = worker.salary;
        document.getElementById('phone').value = worker.phone_number || '';
        document.getElementById('address').value = worker.address || '';
        editModal.style.display = 'block';
    }

    // Close modal
    closeBtn.addEventListener('click', function() {
        editModal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === editModal) {
            editModal.style.display = 'none';
        }
    });

    // Handle form submission
    editForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            id: parseInt(document.getElementById('worker-id').value),
            name: document.getElementById('name').value.trim(),
            section: document.getElementById('section').value,
            dob: document.getElementById('dob').value,
            salary: parseFloat(document.getElementById('salary').value),
            phone_number: document.getElementById('phone').value.trim(),
            address: document.getElementById('address').value.trim()
        };
        
        try {
            const response = await fetch('./scripts/api/update_worker.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                showSuccess('Worker details updated successfully!');
                populateWorkerTable(searchInput.value); // Refresh with current search
                editModal.style.display = 'none';
            } else {
                showError(result.error || 'Failed to update worker');
            }
        } catch (error) {
            console.error('Error updating worker:', error);
            showError('Failed to update worker details');
        }
    });

    // Search functionality
    searchInput.addEventListener('input', function() {
        populateWorkerTable(this.value);
    });

    // Notification functions
    function showSuccess(message) {
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    function showError(message) {
        const notification = document.createElement('div');
        notification.className = 'notification error';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Initial table population
    populateWorkerTable();
});