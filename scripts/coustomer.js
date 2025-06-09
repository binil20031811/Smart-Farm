let cart = [];
let allProducts = [];

// Initialize when page loads
document.addEventListener("DOMContentLoaded", function() {
    fetchProducts();
});

// Cart Functions
function addToCart(productName, productPrice) {
    const existingProduct = cart.find(item => item.name === productName);
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({ name: productName, price: productPrice, quantity: 1 });
    }
    updateCart();
}

function updateCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById('total-price');
    
    cartItemsContainer.innerHTML = '';
    
    let totalPrice = 0;

    cart.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${item.name} - ₹${item.price.toFixed(2)}</span>
            <div class="quantity-controls">
                <button onclick="changeQuantity(${index}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="changeQuantity(${index}, 1)">+</button>
            </div>
            <button class="remove-button" onclick="removeFromCart(${index})">Remove</button>
        `;
        cartItemsContainer.appendChild(li);
        totalPrice += item.price * item.quantity;
    });

    totalPriceElement.textContent = `Total: ₹${totalPrice.toFixed(2)}`;
}

function changeQuantity(index, change) {
    const item = cart[index];
    item.quantity += change;
    if (item.quantity < 1) {
        cart.splice(index, 1);
    }
    updateCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

function clearCart() {
    cart = [];
    updateCart();
}

function revcart() {
    const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const billItemsContainer = document.getElementById('bill-items');
    const billTotalPrice = document.getElementById('bill-total-price');

    billItemsContainer.innerHTML = '';
    cart.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${item.name} (${item.quantity} x ₹${item.price.toFixed(2)})</span>
            <span>₹${(item.price * item.quantity).toFixed(2)}</span>
        `;
        billItemsContainer.appendChild(li);
    });

    billTotalPrice.innerHTML = `<strong>Total: ₹${totalPrice.toFixed(2)}</strong>`;
    document.getElementById('bill-popup').style.display = 'flex';
}

function closeBillPopup() {
    document.getElementById('bill-popup').style.display = 'none';
}

function confirmOrder() {
    const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

    if (!cart || cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    fetch('./php/reserve_cart.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            cart: cart,
            totalPrice: totalPrice
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            alert(data.success || "Order placed successfully!");
            clearCart();
            closeBillPopup();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert("Failed to place order. Please try again.");
    });
}

// Product Functions
function fetchProducts() {
    fetch('./php/coustomer.php')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            allProducts = data;
            displayProducts(allProducts);
        })
        .catch(error => {
            console.error('Error:', error);
            document.querySelector('.product-grid').innerHTML = 
                '<div class="error">Error loading products. Please try again later.</div>';
        });
}

function displayProducts(products) {
    const productGrid = document.querySelector('.product-grid');
    productGrid.innerHTML = '';
    
    if (!products || products.length === 0) {
        productGrid.innerHTML = '<div class="no-products">No products available</div>';
        return;
    }

    products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('product');
        
        let priceText;
        switch (product.ptype) {
            case 'egg': priceText = `₹${product.price} per 10 pieces`; break;
            case 'milk': priceText = `₹${product.price} per liter`; break;
            case 'meat': priceText = `₹${product.price} per kg`; break;
            default: priceText = `₹${product.price} per unit`; break;
        }

        productDiv.innerHTML = `
            <img src="${product.image_url || 'default-product.jpg'}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${priceText}</p>
            <p>Available: ${product.quantity}</p>
            <button onclick="addToCart('${product.name.replace(/'/g, "\\'")}', ${product.price})">
                Add to Cart
            </button>
        `;
        productGrid.appendChild(productDiv);
    });
}

function filterProducts(type) {
    if (type === 'all') {
        displayProducts(allProducts);
    } else {
        const filteredProducts = allProducts.filter(product => product.ptype === type);
        displayProducts(filteredProducts);
    }
}