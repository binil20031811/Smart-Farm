// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function() {
    // Get the username from URL parameters or sessionStorage
    const urlParams = new URLSearchParams(window.location.search);
    let username = urlParams.get('username') || sessionStorage.getItem('username');
    
    // Store username in sessionStorage for later use
    if (username) {
        sessionStorage.setItem('username', username);
    }

    // Get all the navigation links and feature items
    const navLinks = document.querySelectorAll(".nav-links a");
    const featureItems = document.querySelectorAll(".feature");

    // Function to add username to URLs (only used for features)
    function addUsernameToUrl(url) {
        if (!username || url.startsWith('http') || url === '#') return url;
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}username=${encodeURIComponent(username)}`;
    }

    // Add click event listeners to the navigation links (unchanged, no username added)
    navLinks.forEach(link => {
        link.addEventListener("click", function(event) {
            event.preventDefault();
            
            // Remove 'active' class from all links
            navLinks.forEach(lnk => lnk.classList.remove("active"));
            
            // Add 'active' class to clicked link
            this.classList.add("active");
            
            // Get the href (no username added)
            let href = this.getAttribute("href");
            if (href !== "#") {
                window.location.href = href;
            }
        });
    });

    // Add click event listeners to the feature items (with username)
    featureItems.forEach(feature => {
        feature.addEventListener("click", function() {
            const featureName = this.querySelector("h3").textContent.toLowerCase();
            window.location.href = addUsernameToUrl(`./${featureName}.html`);
        });
    });

    // Display worker's information if username exists
    if (username) {
        document.getElementById('workerName').textContent = username;
        
        // Fetch worker details from the database
        fetch(`scripts/api/get_worker_details.php?username=${encodeURIComponent(username)}`)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok: ' + response.statusText);
                return response.json();
            })
            .then(data => {
                if (data.error) {
                    console.error(data.error);
                    // Set default values
                    ['workerId', 'workerSection', 'workerDob', 'workerSalary', 'workerPhone', 'workerAddress']
                        .forEach(id => document.getElementById(id).textContent = 'N/A');
                } else {
                    // Populate worker information
                    document.getElementById('workerName').textContent = data.name || username;
                    document.getElementById('workerId').textContent = data.id || 'N/A';
                    document.getElementById('workerSection').textContent = data.section || 'N/A';
                }
            })
            .catch(error => {
                console.error('Error fetching worker details:', error);
                alert('Failed to load worker details. Please try again.');
            });
    }
});

// Helper function to get URL parameters
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}