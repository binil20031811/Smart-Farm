document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("search-input");
    const tableBody = document.querySelector("#product-list tbody");
    const modal = document.getElementById("edit-modal");
    const closeModal = document.querySelector(".close");
    const editForm = document.getElementById("edit-product-form");

    // Fetch products from the server
    async function fetchProducts() {
        try {
            const response = await fetch('products.php');
            const products = await response.json();
            populateTable(products);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    }

    // Populate the table with data
    function populateTable(products) {
        tableBody.innerHTML = ""; // Clear existing rows

        products.forEach(product => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.ptype}</td>
                <td>${product.price}</td>
                <td>${product.quantity}</td>
                <td><i class="fas fa-pencil-alt edit-icon" data-id="${product.id}"></i></td>
            `;
            tableBody.appendChild(row);
        });

        // Add event listeners to edit icons
        const editIcons = document.querySelectorAll(".edit-icon");
        editIcons.forEach(icon => {
            icon.addEventListener("click", () => openEditModal(icon.dataset.id));
        });
    }

    // Open the edit modal
    async function openEditModal(productId) {
        try {
            const response = await fetch(`./scripts/api/getproduct.php?id=${productId}`);
            const product = await response.json();
            populateEditForm(product);
            modal.style.display = "block";
        } catch (error) {
            console.error('Error fetching product details:', error);
        }
    }

    // Populate the edit form with product details
    function populateEditForm(product) {
        document.getElementById('product-id').value = product.id;
        document.getElementById('name').value = product.name;
        document.getElementById('ptype').value = product.ptype;
        document.getElementById('price').value = product.price;
        document.getElementById('quantity').value = product.quantity;
    }

    // Close the modal
    closeModal.addEventListener("click", () => {
        modal.style.display = "none";
    });

    // Handle form submission
    editForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const productData = {
            id: document.getElementById('product-id').value,
            name: document.getElementById('name').value,
            ptype: document.getElementById('ptype').value,
            price: document.getElementById('price').value,
            quantity: document.getElementById('quantity').value
        };

        try {
            const response = await fetch('./scripts/api/updateproduct.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });

            if (response.ok) {
                alert('Product updated successfully!');
                modal.style.display = "none";
                fetchProducts(); // Refresh the table
            } else {
                alert('Failed to update product.');
            }
        } catch (error) {
            console.error('Error updating product:', error);
        }
    });

    // Search functionality
    searchInput.addEventListener("input", function () {
        const searchTerm = this.value.toLowerCase();
        const rows = tableBody.querySelectorAll("tr");

        rows.forEach(row => {
            const cells = row.querySelectorAll("td");
            let match = false;

            cells.forEach(cell => {
                if (cell.textContent.toLowerCase().includes(searchTerm)) {
                    match = true;
                }
            });

            row.style.display = match ? "" : "none";
        });
    });

    // Fetch products when the page loads
    fetchProducts();
});