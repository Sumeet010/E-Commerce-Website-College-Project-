document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            loadOrders(user.uid);
        } else {
            window.location.href = 'login.html';
        }
    });
});

async function loadOrders(userId) {
    const ordersContainer = document.getElementById('orders-container');
    
    // Show loading state
    ordersContainer.innerHTML = `
        <div class="loading">
            <p>Loading your orders...</p>
        </div>
    `;

    try {
        const ordersSnapshot = await firebase.firestore()
            .collection('orders')
            .where('userId', '==', userId)
            .orderBy('orderDate', 'desc')
            .get();

        if (ordersSnapshot.empty) {
            ordersContainer.innerHTML = `
                <div class="no-orders">
                    <p>You haven't placed any orders yet.</p>
                    <a href="Electronics.html" class="shop-now-btn">Start Shopping</a>
                </div>
            `;
            return;
        }

        let ordersHTML = '';
        ordersSnapshot.forEach(doc => {
            const order = doc.data();
            const orderDate = order.orderDate.toDate().toLocaleDateString();
            
            const orderCard = `
                <div class="order-card">
                    <div class="order-header">
                        <span class="order-id">Order ID: ${doc.id}</span>
                        <span class="order-date">Ordered on: ${orderDate}</span>
                    </div>
                    <div class="order-content">
                        <div class="product-info">
                            <div class="product-details">
                                <h4>${order.productName}</h4>
                                <p class="price">₹${order.price}</p>
                                <span class="status status-${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                            </div>
                        </div>
                        <div class="shipping-info">
                            <p><strong>Customer Name:</strong> ${order.customerName}</p>
                            <p><strong>Shipping Address:</strong> ${order.address}</p>
                            <p><strong>Contact:</strong> ${order.phone}</p>
                            <p><strong>Email:</strong> ${order.email}</p>
                        </div>
                    </div>
                </div>
            `;
            
            ordersHTML += orderCard;
        });

        ordersContainer.innerHTML = ordersHTML;

    } catch (error) {
        console.error('Error loading orders:', error);
        
        // Check if error is about missing index
        if (error.code === 'failed-precondition') {
            ordersContainer.innerHTML = `
                <div class="error-message">
                    <p>System is being updated. Please try again in a few minutes.</p>
                </div>
            `;
        } else {
            ordersContainer.innerHTML = `
                <div class="error-message">
                    <p>Error loading orders. Please try again later.</p>
                </div>
            `;
        }
    }
} 