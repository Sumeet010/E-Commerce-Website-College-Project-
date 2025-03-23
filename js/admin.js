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
    loadInventoryStats();
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
    firebase.firestore().collection('products').get()
        .then(snapshot => {
            const productsList = document.getElementById('products-list');
            if (!productsList) return;
            
            productsList.innerHTML = '';
            
            snapshot.forEach(doc => {
                const product = doc.data();
                const stockStatus = getStockStatus(product.stock || 0);
                const productElement = `
                    <div class="product-item">
                        <img src="${product.imageUrl}" alt="${product.name}">
                        <h3>${product.name}</h3>
                        <p>₹${product.price}</p>
                        <p>Category: ${product.category}</p>
                        <p class="stock-status ${stockStatus.class}">${stockStatus.text}</p>
                        <div class="product-actions">
                            <button onclick="updateStock('${doc.id}', ${product.stock || 0})" class="stock-btn">Update Stock</button>
                            <button onclick="editProduct('${doc.id}')" class="edit-btn">Edit</button>
                            <button onclick="deleteProduct('${doc.id}')" class="delete-btn">Delete</button>
                        </div>
                    </div>
                `;
                productsList.innerHTML += productElement;
            });
        })
        .catch(error => {
            console.error('Error loading products:', error);
            alert('Error loading products');
        });
}

// Show/Hide Product Form
function showAddProductForm() {
    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.style.display = 'block';
        // Reset form and set it back to add mode
        document.getElementById('productForm').reset();
        document.getElementById('productForm').onsubmit = handleProductSubmit;
    }
}

// Handle Product Form Submit (Add new product)
document.addEventListener('DOMContentLoaded', () => {
    // Add form submit event listener
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }
});

function handleProductSubmit(event) {
    event.preventDefault();
    
    // Get form values
    const productData = {
        name: document.getElementById('productName').value,
        price: Number(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value,
        imageUrl: document.getElementById('productImage').value,
        description: document.getElementById('productDescription').value,
        stock: Number(document.getElementById('productStock').value || 0),
        createdAt: new Date(),
        updatedAt: new Date()
    };

    // Validate data
    if (!productData.name || !productData.price || !productData.imageUrl) {
        alert('Please fill in all required fields');
        return;
    }

    // Add to Firestore
    firebase.firestore().collection('products').add(productData)
        .then(() => {
            alert('Product added successfully!');
            document.getElementById('productForm').reset();
            document.getElementById('product-form').style.display = 'none';
            loadProducts();
            loadInventoryStats();
        })
        .catch(error => {
            console.error('Error adding product:', error);
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
            if (!doc.exists) {
                alert('Product not found. It may have been deleted.');
                return;
            }

            const product = doc.data();
            document.getElementById('productName').value = product.name || '';
            document.getElementById('productPrice').value = product.price || '';
            document.getElementById('productCategory').value = product.category || 'electronics';
            document.getElementById('productImage').value = product.imageUrl || '';
            document.getElementById('productDescription').value = product.description || '';
            document.getElementById('productStock').value = product.stock || 0;
            
            showAddProductForm();
            // Update form submit handler to update instead of add
            const form = document.getElementById('productForm');
            form.onsubmit = (e) => updateProduct(e, productId);
        })
        .catch(error => {
            console.error('Error loading product:', error);
            alert('Error loading product details');
        });
}

// Update Product
async function updateProduct(event, productId) {
    event.preventDefault();
    
    try {
        // First check if the product exists
        const productRef = db.collection('products').doc(productId);
        const productDoc = await productRef.get();
        
        if (!productDoc.exists) {
            alert('Product not found. It may have been deleted.');
            return;
        }

        const productData = {
            name: document.getElementById('productName').value,
            price: Number(document.getElementById('productPrice').value),
            category: document.getElementById('productCategory').value,
            imageUrl: document.getElementById('productImage').value,
            description: document.getElementById('productDescription').value,
            stock: Number(document.getElementById('productStock').value || 0),
            updatedAt: new Date()
        };

        await productRef.update(productData);
        
        alert('Product updated successfully!');
        document.getElementById('product-form').style.display = 'none';
        loadProducts();
        loadInventoryStats();
        
        // Reset form back to add mode
        const form = document.getElementById('productForm');
        form.onsubmit = handleProductSubmit;
        
    } catch (error) {
        console.error('Error updating product:', error);
        alert('Error updating product: ' + error.message);
    }
}

// Load Orders
async function loadOrders() {
    try {
        const ordersSnapshot = await firebase.firestore().collection('orders')
            .orderBy('orderDate', 'desc')
            .get();

        const ordersList = document.getElementById('orders-list');
        ordersList.innerHTML = '';

        ordersSnapshot.forEach(doc => {
            const order = doc.data();
            const orderDate = order.orderDate.toDate().toLocaleDateString();
            
            // Determine payment status class
            let paymentStatusClass = '';
            if (order.paymentMethod === 'upi') {
                if (order.paymentStatus === 'awaiting verification') {
                    paymentStatusClass = 'status-pending';
                } else if (order.paymentStatus === 'payment verified') {
                    paymentStatusClass = 'status-delivered';
                } else if (order.paymentStatus === 'payment failed') {
                    paymentStatusClass = 'status-cancelled';
                }
            }
            
            const row = `
                <tr>
                    <td>${doc.id}</td>
                    <td>${order.customerName}</td>
                    <td>${order.productName}</td>
                    <td>₹${order.price}</td>
                    <td>
                        <select onchange="updateOrderStatus('${doc.id}', this.value)" class="status-${order.status}">
                            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                            <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </td>
                    <td>
                        <span class="payment-method ${paymentStatusClass}">
                            ${order.paymentMethod === 'free-delivery' ? 'COD' : 'UPI'}
                        </span>
                        <button onclick="viewOrderDetails('${doc.id}')" class="view-btn">View Details</button>
                    </td>
                </tr>
            `;
            ordersList.innerHTML += row;
        });

        updateDashboardStats();

    } catch (error) {
        console.error('Error loading orders:', error);
        alert('Error loading orders');
    }
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
async function viewOrderDetails(orderId) {
    try {
        const orderDoc = await firebase.firestore().collection('orders').doc(orderId).get();
        const order = orderDoc.data();

        // Create payment status options with the current status selected
        const paymentStatusOptions = `
            <select id="payment-status-select" class="status-${order.paymentStatus.replace(' ', '-')}">
                <option value="awaiting verification" ${order.paymentStatus === 'awaiting verification' ? 'selected' : ''}>Awaiting Verification</option>
                <option value="payment verified" ${order.paymentStatus === 'payment verified' ? 'selected' : ''}>Payment Verified</option>
                <option value="payment failed" ${order.paymentStatus === 'payment failed' ? 'selected' : ''}>Payment Failed</option>
                <option value="pending" ${order.paymentStatus === 'pending' ? 'selected' : ''}>Pending</option>
            </select>
            <button onclick="updatePaymentStatus('${orderId}')" class="view-btn">Update Payment</button>
        `;

        // Create transaction ID display for UPI payments
        const transactionIdSection = order.paymentMethod === 'upi' && order.transactionId ? 
            `<div class="transaction-section">
                <p><strong>Transaction ID:</strong></p>
                <div class="transaction-id">${order.transactionId}</div>
                <p class="transaction-note">Verify this transaction ID in your UPI account</p>
             </div>` : '';

        const modalContainer = document.getElementById('order-details-modal');
        modalContainer.innerHTML = `
            <div class="modal-content">
                <span class="close-modal" onclick="closeOrderDetails()">&times;</span>
                <h3>Order Details</h3>
                <div class="order-info">
                    <div class="info-group">
                        <h4>Order Information</h4>
                        <p><strong>Order ID:</strong> ${orderId}</p>
                        <p><strong>Order Date:</strong> ${order.orderDate.toDate().toLocaleString()}</p>
                        <p><strong>Status:</strong> ${order.status}</p>
                        <p><strong>Total Amount:</strong> ₹${order.price}</p>
                    </div>
                    
                    <div class="info-group">
                        <h4>Payment Information</h4>
                        <p><strong>Payment Method:</strong> ${order.paymentMethod === 'free-delivery' ? 'Cash on Delivery' : 'UPI Payment'}</p>
                        ${transactionIdSection}
                        <p><strong>Payment Status:</strong> 
                            ${order.paymentMethod === 'upi' ? paymentStatusOptions : order.paymentStatus}
                        </p>
                    </div>
                    
                    <div class="info-group">
                        <h4>Customer Information</h4>
                        <p><strong>Name:</strong> ${order.customerName}</p>
                        <p><strong>Email:</strong> ${order.email}</p>
                        <p><strong>Phone:</strong> ${order.phone}</p>
                        <p><strong>Shipping Address:</strong> ${order.address}</p>
                    </div>
                    
                    <div class="info-group">
                        <h4>Product Information</h4>
                        <p><strong>Product Name:</strong> ${order.productName}</p>
                        <p><strong>Price:</strong> ₹${order.price}</p>
                    </div>
                </div>
            </div>
        `;
        modalContainer.style.display = 'block';

    } catch (error) {
        console.error('Error loading order details:', error);
        alert('Error loading order details');
    }
}

function closeOrderDetails() {
    const modalContainer = document.getElementById('order-details-modal');
    modalContainer.style.display = 'none';
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

// Add function to delete order
async function deleteOrder(orderId) {
    if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
        try {
            await firebase.firestore().collection('orders').doc(orderId).delete();
            alert('Order deleted successfully');
            loadOrders(); // Refresh the orders list
        } catch (error) {
            console.error('Error deleting order:', error);
            alert('Error deleting order');
        }
    }
}

// Add function to print order details
async function printOrderDetails(orderId) {
    try {
        const orderDoc = await firebase.firestore().collection('orders').doc(orderId).get();
        const order = orderDoc.data();
        
        // Create print content
        const printContent = `
            <div class="print-order">
                <h2>Order Details</h2>
                <p><strong>Order ID:</strong> ${orderId}</p>
                <p><strong>Customer:</strong> ${order.customerName}</p>
                <p><strong>Email:</strong> ${order.email}</p>
                <p><strong>Phone:</strong> ${order.phone}</p>
                <p><strong>Address:</strong> ${order.address}</p>
                <p><strong>Product:</strong> ${order.productName}</p>
                <p><strong>Price:</strong> ₹${order.price}</p>
                <p><strong>Status:</strong> ${order.status}</p>
                <p><strong>Order Date:</strong> ${order.orderDate.toDate().toLocaleString()}</p>
            </div>
        `;

        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Order Details - ${orderId}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        .print-order { max-width: 800px; margin: 0 auto; }
                        h2 { color: #333; }
                        p { margin: 10px 0; }
                        strong { color: #555; }
                    </style>
                </head>
                <body>
                    ${printContent}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    } catch (error) {
        console.error('Error printing order details:', error);
        alert('Error printing order details');
    }
}

// Update the updateDashboardStats function
async function updateDashboardStats() {
    try {
        // Get all orders
        const ordersSnapshot = await firebase.firestore().collection('orders').get();
        
        let totalOrders = 0;
        let totalRevenue = 0;
        let monthlyRevenue = 0;
        
        // Get current month and year
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        ordersSnapshot.forEach(doc => {
            const order = doc.data();
            
            // Only count orders that are not cancelled
            if (order.status !== 'cancelled') {
                totalOrders++;
                
                // Add to total revenue if order is delivered
                if (order.status === 'delivered') {
                    totalRevenue += Number(order.price);
                    
                    // Check if order is from current month
                    const orderDate = order.orderDate.toDate();
                    if (orderDate.getMonth() === currentMonth && 
                        orderDate.getFullYear() === currentYear) {
                        monthlyRevenue += Number(order.price);
                    }
                }
            }
        });

        // Update the dashboard display
        document.getElementById('total-orders').textContent = totalOrders;
        document.getElementById('total-revenue').textContent = `₹${totalRevenue.toFixed(2)}`;
        document.getElementById('monthly-revenue').textContent = `₹${monthlyRevenue.toFixed(2)}`;

    } catch (error) {
        console.error('Error updating dashboard stats:', error);
    }
}

// Load Inventory Statistics
async function loadInventoryStats() {
    try {
        const snapshot = await db.collection('products').get();
        let totalStock = 0;
        let lowStock = 0;
        let outOfStock = 0;

        snapshot.forEach(doc => {
            const product = doc.data();
            const stockLevel = product.stock || 0;
            
            totalStock += stockLevel;
            if (stockLevel === 0) outOfStock++;
            if (stockLevel > 0 && stockLevel <= 10) lowStock++;
        });

        // Update dashboard stats
        document.getElementById('total-stock').textContent = totalStock;
        document.getElementById('low-stock').textContent = lowStock;
        document.getElementById('out-of-stock').textContent = outOfStock;

        updateProductsWithStock();

    } catch (error) {
        console.error('Error loading inventory stats:', error);
    }
}

// Helper function to get stock status
function getStockStatus(stock) {
    if (stock === 0) {
        return {
            text: 'Out of Stock',
            class: 'status-cancelled'
        };
    }
    if (stock <= 10) {
        return {
            text: 'Low Stock',
            class: 'status-pending'
        };
    }
    return {
        text: 'In Stock',
        class: 'status-delivered'
    };
}

// Update stock level
async function updateStock(productId, currentStock) {
    const newStock = prompt(`Enter new stock level (current: ${currentStock}):`, currentStock);
    if (newStock === null) return;

    const stock = parseInt(newStock);
    if (isNaN(stock) || stock < 0) {
        alert('Please enter a valid number');
        return;
    }

    try {
        await db.collection('products').doc(productId).update({
            stock: stock,
            updatedAt: new Date()
        });
        loadProducts();
        loadInventoryStats();
        alert('Stock updated successfully!');
    } catch (error) {
        console.error('Error updating stock:', error);
        alert('Error updating stock');
    }
}

// Update existing loadProducts function to include stock information
function loadProducts() {
    db.collection('products').get()
        .then(snapshot => {
            const productsList = document.getElementById('products-list');
            productsList.innerHTML = '';
            
            snapshot.forEach(doc => {
                const product = doc.data();
                const stockStatus = getStockStatus(product.stock || 0);
                const productElement = `
                    <div class="product-item">
                        <img src="${product.imageUrl}" alt="${product.name}">
                        <h3>${product.name}</h3>
                        <p>₹${product.price}</p>
                        <p>Category: ${product.category}</p>
                        <p class="stock-status ${stockStatus.class}">${stockStatus.text}</p>
                        <div class="product-actions">
                            <button onclick="updateStock('${doc.id}', ${product.stock || 0})" class="stock-btn">Update Stock</button>
                            <button onclick="editProduct('${doc.id}')" class="edit-btn">Edit</button>
                            <button onclick="deleteProduct('${doc.id}')" class="delete-btn">Delete</button>
                        </div>
                    </div>
                `;
                productsList.innerHTML += productElement;
            });
        });
}

// Update handleProductSubmit to include stock
function handleProductSubmit(event) {
    event.preventDefault();
    
    const productData = {
        name: document.getElementById('productName').value,
        price: Number(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value,
        imageUrl: document.getElementById('productImage').value,
        description: document.getElementById('productDescription').value,
        stock: Number(document.getElementById('productStock').value || 0),
        createdAt: new Date(),
        updatedAt: new Date()
    };

    db.collection('products').add(productData)
        .then(() => {
            alert('Product added successfully!');
            document.getElementById('productForm').reset();
            document.getElementById('product-form').style.display = 'none';
            loadProducts();
            loadInventoryStats();
        })
        .catch(error => {
            console.error('Error adding product:', error);
            alert('Error adding product: ' + error.message);
        });
}

// Add function to update payment status
function updatePaymentStatus(orderId) {
    const paymentStatusSelect = document.getElementById('payment-status-select');
    const newPaymentStatus = paymentStatusSelect.value;
    
    firebase.firestore().collection('orders').doc(orderId).update({
        paymentStatus: newPaymentStatus,
        updatedAt: new Date()
    })
    .then(() => {
        alert('Payment status updated successfully!');
        // If payment is verified, we might want to update the order status as well
        if (newPaymentStatus === 'payment verified') {
            return firebase.firestore().collection('orders').doc(orderId).update({
                status: 'processing'
            });
        }
        // If payment failed, we might want to cancel the order
        if (newPaymentStatus === 'payment failed') {
            return firebase.firestore().collection('orders').doc(orderId).update({
                status: 'cancelled'
            });
        }
    })
    .then(() => {
        // Refresh the orders list
        loadOrders();
    })
    .catch((error) => {
        console.error("Error updating payment status: ", error);
        alert('Error updating payment status');
    });
} 