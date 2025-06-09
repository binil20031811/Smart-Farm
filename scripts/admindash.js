// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function() {
    // Get all the navigation links
    const navLinks = document.querySelectorAll(".nav-links a");
    const featureItems = document.querySelectorAll(".feature");

    // Add click event listeners to the navigation links
    navLinks.forEach(link => {
        link.addEventListener("click", function(event) {
            event.preventDefault(); // Prevent the default link behavior

            // Remove the 'active' class from all links
            navLinks.forEach(lnk => lnk.classList.remove("active"));

            // Add the 'active' class to the clicked link
            this.classList.add("active");

            // Redirect to the corresponding page
            const href = this.getAttribute("href");
            if (href !== "#") {
                window.location.href = href;
            }
        });
    });

    // Add click event listeners to the feature items
    featureItems.forEach(feature => {
        feature.addEventListener("click", function() {
            // Get the text content of the feature (lowercase to match the file name)
            const featureName = this.querySelector("h3").textContent.toLowerCase();

            // Redirect to the corresponding page
            window.location.href =`${featureName}.html`;
        });
    });
});