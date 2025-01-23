// Authentication check
let authCheckDone = false;

firebase.auth().onAuthStateChanged(user => {
    if (!user || sessionStorage.getItem('isAdmin') !== 'true') {
        // No user is signed in or not admin
        sessionStorage.removeItem('isAdmin');
        window.location.href = 'admin-login.html';
        return;
    }

    // User is authenticated and is admin, load dashboard
    loadAdminDashboard();
});

// Check if user is admin
function checkAdminAuth() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            // Check if user has admin role
            db.collection('users').doc(user.uid).get()
                .then(doc => {
                    if (doc.exists && doc.data().role === 'admin') {
                        loadAdminDashboard();
                    } else {
                        window.location.href = '../index.html';
                        alert('Access denied. Admin only.');
                    }
                });
        } else {
            window.location.href = 'login.html';
        }
    });
}

// Load admin dashboard
function loadAdminDashboard() {
    loadDashboardStats();
    loadProducts();
    loadOrders();
}

// Dashboard Statistics
function loadDashboardStats() {
    // Products count
    db.collection('products').get().then(snap => {
        document.getElementById('total-products').textContent = snap.size;
    });

    // Orders count and revenue
    db.collection('orders').get().then(snap => {
        document.getElementById('total-orders').textContent = snap.size;
        let revenue = 0;
        snap.forEach(doc => {
            revenue += doc.data().totalAmount || 0;
        });
        document.getElementById('total-revenue').textContent = '₹' + revenue;
    });
}

// Product Management
function loadProducts() {
    db.collection('products').get()
        .then(snapshot => {
            const productsList = document.getElementById('products-list');
            productsList.innerHTML = '';
            
            snapshot.forEach(doc => {
                const product = doc.data();
                const productElement = `
                    <div class="product-item">
                        <img src="${product.imageUrl}" alt="${product.name}">
                        <h3>${product.name}</h3>
                        <p>₹${product.price}</p>
                        <div class="product-actions">
                            <button onclick="editProduct('${doc.id}')" class="edit-btn">Edit</button>
                            <button onclick="deleteProduct('${doc.id}')" class="delete-btn">Delete</button>
                        </div>
                    </div>
                `;
                productsList.innerHTML += productElement;
            });
        });
}

// Show/Hide Product Form
function showAddProductForm() {
    document.getElementById('product-form').style.display = 'block';
    document.getElementById('productForm').reset();
}

// Handle Product Form Submit
function handleProductSubmit(event) {
    event.preventDefault();
    
    const productData = {
        name: document.getElementById('productName').value,
        price: Number(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value,
        imageUrl: document.getElementById('productImage').value,
        description: document.getElementById('productDescription').value,
        createdAt: new Date()
    };

    db.collection('products').add(productData)
        .then(() => {
            alert('Product added successfully!');
            document.getElementById('product-form').style.display = 'none';
            loadProducts();
        })
        .catch(error => {
            alert('Error adding product: ' + error.message);
        });
}

// Delete Product
function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        db.collection('products').doc(productId).delete()
            .then(() => {
                alert('Product deleted successfully!');
                loadProducts();
            })
            .catch(error => {
                alert('Error deleting product: ' + error.message);
            });
    }
}

// Edit Product
function editProduct(productId) {
    db.collection('products').doc(productId).get()
        .then(doc => {
            const product = doc.data();
            document.getElementById('productName').value = product.name;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productImage').value = product.imageUrl;
            document.getElementById('productDescription').value = product.description;
            
            showAddProductForm();
            // Update form submit handler to update instead of add
            const form = document.getElementById('productForm');
            form.onsubmit = (e) => updateProduct(e, productId);
        });
}

// Update Product
function updateProduct(event, productId) {
    event.preventDefault();
    
    const productData = {
        name: document.getElementById('productName').value,
        price: Number(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value,
        imageUrl: document.getElementById('productImage').value,
        description: document.getElementById('productDescription').value,
        updatedAt: new Date()
    };

    db.collection('products').doc(productId).update(productData)
        .then(() => {
            alert('Product updated successfully!');
            document.getElementById('product-form').style.display = 'none';
            loadProducts();
        })
        .catch(error => {
            alert('Error updating product: ' + error.message);
        });
}

// Load Orders
function loadOrders() {
    db.collection('orders')
        .orderBy('createdAt', 'desc')
        .get()
        .then((snapshot) => {
            const ordersList = document.getElementById('orders-list');
            ordersList.innerHTML = '';
            
            snapshot.forEach((doc) => {
                const order = doc.data();
                const orderElement = `
                    <tr>
                        <td>${doc.id}</td>
                        <td>${order.userName}</td>
                        <td>${order.items.length} items</td>
                        <td>₹${order.totalAmount}</td>
                        <td>
                            <select onchange="updateOrderStatus('${doc.id}', this.value)">
                                <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                                <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                                <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                                <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                                <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                            </select>
                        </td>
                        <td>
                            <button onclick="viewOrderDetails('${doc.id}')" class="view-btn">View Details</button>
                        </td>
                    </tr>
                `;
                ordersList.innerHTML += orderElement;
            });
        });
}

// Update Order Status
function updateOrderStatus(orderId, newStatus) {
    db.collection('orders').doc(orderId).update({
        status: newStatus,
        updatedAt: new Date()
    })
    .then(() => {
        alert('Order status updated successfully!');
    })
    .catch((error) => {
        console.error("Error updating order: ", error);
        alert('Error updating order status');
    });
}

// View Order Details
function viewOrderDetails(orderId) {
    db.collection('orders').doc(orderId).get()
        .then((doc) => {
            const order = doc.data();
            const detailsHtml = `
                <div class="order-details">
                    <h3>Order Details</h3>
                    <p><strong>Order ID:</strong> ${doc.id}</p>
                    <p><strong>Customer:</strong> ${order.userName}</p>
                    <p><strong>Email:</strong> ${order.userEmail}</p>
                    <p><strong>Date:</strong> ${order.createdAt.toDate().toLocaleString()}</p>
                    <p><strong>Status:</strong> ${order.status}</p>
                    <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
                    
                    <h4>Items:</h4>
                    <ul>
                        ${order.items.map(item => `
                            <li>${item.name} - ₹${item.price} x ${item.quantity}</li>
                        `).join('')}
                    </ul>
                </div>
            `;
            document.getElementById('order-details-container').innerHTML = detailsHtml;
            document.getElementById('order-details-container').style.display = 'block';
        });
}

// Show different sections
function showSection(sectionName) {
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(`${sectionName}-section`).style.display = 'block';
}

// Logout
function logout() {
    sessionStorage.removeItem('isAdmin');
    firebase.auth().signOut()
        .then(() => {
            window.location.href = 'admin-login.html';
        })
        .catch(error => {
            console.error("Error logging out:", error);
        });
}

// Initialize admin page
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
    showSection('dashboard'); // Show dashboard by default
}); 