document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const tableBody = document.getElementById('checkout-table-body');
    const billTotalInput = document.getElementById('bill-total');
    const printButton = document.getElementById('print-button');
    const saveButton = document.getElementById('save-button');
    const clearButton = document.getElementById('clear-button');
    const downloadButton = document.getElementById('download-button');

    let items = [];
    let isBillSaved = false; // Flag to track if the bill is saved

    // Disable print and download buttons initially
    printButton.disabled = true;
    downloadButton.disabled = true;

    // Show products when search bar is clicked
    searchInput.addEventListener('focus', async () => {
        const response = await fetch('api/get_products.php?search=');
        const products = await response.json();
        displaySearchResults(products);
    });

    // Hide products when clicking outside the search bar
    document.addEventListener('click', (e) => {
        if (e.target !== searchInput) {
            searchResults.style.display = 'none';
        }
    });

    // Fetch products on search
    searchInput.addEventListener('input', async (e) => {
        const searchQuery = e.target.value;
        const response = await fetch(`api/get_products.php?search=${searchQuery}`);
        const products = await response.json();
        displaySearchResults(products);
    });

    // Display search results
    function displaySearchResults(products) {
        searchResults.innerHTML = '';
        if (products.length === 0) {
            searchResults.style.display = 'none';
        } else {
            searchResults.style.display = 'block';
            products.forEach(product => {
                const item = document.createElement('div');
                item.textContent = `${product.name} - ${product.price} ${product.unit}`;
                item.addEventListener('click', () => addToCheckout(product));
                searchResults.appendChild(item);
            });
        }
    }

    // Add product to checkout
    async function addToCheckout(product) {
        // Fetch the current available quantity from the database
        const response = await fetch(`api/get_product_quantity.php?id=${product.id}`);
        const data = await response.json();
        const availableQuantity = data.quantity;

        const existingItem = items.find(item => item.id === product.id);
        if (existingItem) {
            if (existingItem.quantity + 1 > availableQuantity) {
                alert(`Only ${availableQuantity} units of ${product.name} are available.`);
                return;
            }
            existingItem.quantity += 1;
        } else {
            if (1 > availableQuantity) {
                alert(`Only ${availableQuantity} units of ${product.name} are available.`);
                return;
            }
            items.push({ ...product, quantity: 1 });
        }
        updateCheckoutTable();
        searchResults.innerHTML = ''; // Clear search results
        searchInput.value = ''; // Clear search input
    }

    // Update checkout table
    function updateCheckoutTable() {
        tableBody.innerHTML = '';
        let total = 0;
        items.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.name}</td>
                <td>${item.price}</td>
                <td>${item.unit}</td>
                <td><input type="number" value="${item.quantity}" min="1" onchange="updateQuantity(${index}, this.value)"></td>
                <td>${(item.price * item.quantity).toFixed(2)}</td>
                <td><i class="fas fa-trash remove-icon" onclick="removeProduct(${index})"></i></td>
            `;
            tableBody.appendChild(row);
            total += item.price * item.quantity;
        });
        billTotalInput.value = total.toFixed(2);
    }

    // Update quantity
    window.updateQuantity = async (index, quantity) => {
        const productId = items[index].id;
        const response = await fetch(`api/get_product_quantity.php?id=${productId}`);
        const data = await response.json();
        const availableQuantity = data.quantity;

        if (quantity > availableQuantity) {
            alert(`Only ${availableQuantity} units of ${items[index].name} are available.`);
            return;
        }

        items[index].quantity = parseInt(quantity);
        updateCheckoutTable();
    };

    // Remove product
    window.removeProduct = (index) => {
        items.splice(index, 1);
        updateCheckoutTable();
    };

    // Print bill
    printButton.addEventListener('click', () => {
        if (!isBillSaved) {
            alert('Please save the bill before printing.');
            return;
        }
        window.print();
    });

    // Save bill
    saveButton.addEventListener('click', async () => {
        const response = await fetch('api/save_bill.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items, total: billTotalInput.value })
        });
        const result = await response.json();
        if (result.success) {
            alert('Bill saved successfully!');
            isBillSaved = true; // Set the flag to true
            printButton.disabled = false; // Enable print button
            downloadButton.disabled = false; // Enable download button
        }
    });

    // Clear checkout
    clearButton.addEventListener('click', () => {
        items = [];
        updateCheckoutTable();
        isBillSaved = false; // Reset the flag
        printButton.disabled = true; // Disable print button
        downloadButton.disabled = true; // Disable download button
    });

    // Download bill as PDF
    downloadButton.addEventListener('click', () => {
        if (!isBillSaved) {
            alert('Please save the bill before downloading.');
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Company Name and Logo
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('SMART FARM', 105, 20, { align: 'center' });

        // Bill Date
        const billDate = new Date().toLocaleDateString();
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Date: ${billDate}`, 15, 30);

        // Bill Number (Optional: You can generate a unique bill number)
        const billNumber = Math.floor(Math.random() * 1000000); // Random bill number
        doc.text(`Bill No: ${billNumber}`, 15, 40);

        // Add a line separator
        doc.setDrawColor(0);
        doc.setLineWidth(0.5);
        doc.line(15, 45, 195, 45);

        // Bill Header
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Itemized Bill', 15, 55);

        // Table Headers
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('S.No', 15, 65);
        doc.text('Item Name', 40, 65);
        doc.text('Price', 110, 65);
        doc.text('Qty', 140, 65);
        doc.text('Total', 170, 65);

        // Add a line separator
        doc.line(15, 70, 195, 70);

        // Itemized List
        let yPos = 80; // Starting Y position for items
        items.forEach((item, index) => {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(`${index + 1}`, 15, yPos);
            doc.text(item.name, 40, yPos);

            // Convert price to a number if it's a string
            const price = parseFloat(item.price).toFixed(2);
            doc.text(`Rs ${price}`, 110, yPos); // ₹ symbol added

            // Ensure quantity is treated as plain text
            doc.text(item.quantity.toString(), 140, yPos);

            // Calculate total for the item
            const total = (parseFloat(item.price) * item.quantity).toFixed(2);
            doc.text(`Rs ${total}`, 170, yPos); // ₹ symbol added

            yPos += 10; // Move to the next line
        });

        // Add a line separator
        doc.line(15, yPos, 195, yPos);

        // Total Amount
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total Amount: Rs ${billTotalInput.value}`, 15, yPos + 15);

        // Footer
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Thank you for your purchase!', 105, yPos + 30, { align: 'center' });

        // Save the PDF
        doc.save(`Bill_${billNumber}.pdf`);
    });
});