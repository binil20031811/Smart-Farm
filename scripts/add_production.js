document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');


    // Fetch worker details using username
    fetch(`./scripts/api/get_worker_by_username.php?username=${encodeURIComponent(username)}`)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
           // if (data.error) throw new Error(data.error);
            
            // Display current date
            const today = new Date();
            const formattedDate = today.toLocaleDateString('en-CA'); // YYYY-MM-DD format
            document.getElementById('current-date').textContent = formattedDate;
            
            // Display worker section and output
            document.getElementById('worker-section').textContent = data.section;
            document.getElementById('section-output').textContent = data.output;
            
            // Set hidden fields
            document.getElementById('product-name').value = data.output;
            document.getElementById('production-date').value = formattedDate;
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to load worker details: ' + error.message);
        });

    // Form submission
    document.querySelector('.production-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            username: username,
            product_name: document.getElementById('product-name').value,
            quantity: parseFloat(document.getElementById('quantity').value),
            date: document.getElementById('production-date').value,
            notes: document.getElementById('notes').value
        };

        if (isNaN(formData.quantity)) {
            alert('Please enter a valid quantity');
            return;
        }

        fetch('./scripts/api/add_production_by_username.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Production added successfully!');
                window.location.href = `workerdash.html?username=${encodeURIComponent(username)}`;
            } else {
                throw new Error(data.error || 'Failed to add production');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error: ' + error.message);
        });
    });
});