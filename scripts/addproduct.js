document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("add-product-form");
    const errorMessageDiv = document.getElementById("error-message");

    form.addEventListener("submit", function(event) {
        event.preventDefault(); // Prevent the default form submission

        // Gather form data
        const productId = document.getElementById("product-id").value;
        const productName = document.getElementById("product-name").value;
        const productType = document.getElementById("product-type").value;
        const price = document.getElementById("price").value;
        const imageUrl = document.getElementById("image-url").value;

        // Create a data object
        const productData = {
            productId: parseInt(productId), // Convert to integer
            productName: productName,
            productType: productType,
            price: price,
            imageUrl: imageUrl
        };

        // Send data to the server
        fetch('addproduct.php', { // Update the path to your PHP script
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Handle success (e.g., show a success message or redirect)
                alert('Product added successfully!');
                form.reset(); // Reset the form
                errorMessageDiv.textContent = ''; // Clear any previous error messages
            } else {
                // Handle error
                errorMessageDiv.textContent = data.message;
            }
        })
        .catch(error => {
            // Handle fetch error
            errorMessageDiv.textContent = 'An error occurred: ' + error.message;
        });
    });
});