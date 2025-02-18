document.addEventListener('DOMContentLoaded', async () => {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('productId');
    const productName = urlParams.get('name');
    const productPrice = urlParams.get('price');
    const productImageUrl = urlParams.get('imageUrl');

    // Display product details
    document.getElementById('productName').textContent = productName;
    document.getElementById('productPrice').textContent = productPrice;
    document.getElementById('productImage').style.backgroundImage = `url('${productImageUrl}')`;

    // Fetch and display stock information
    try {
        const productDoc = await firebase.firestore().collection('products').doc(productId).get();
        const stock = productDoc.data().stock || 0;
        const stockElement = document.getElementById('stockInfo');
        
        if (stock === 0) {
            stockElement.textContent = 'Out of Stock';
            stockElement.className = 'stock-info out-of-stock';
            document.querySelector('button[type="submit"]').disabled = true;
        } else if (stock <= 5) {
            stockElement.textContent = `Only ${stock} left in stock!`;
            stockElement.className = 'stock-info low-stock';
        } else {
            stockElement.textContent = 'In Stock';
            stockElement.className = 'stock-info in-stock';
        }
    } catch (error) {
        console.error('Error fetching stock:', error);
    }

    // Handle form submission
    document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const user = firebase.auth().currentUser;
        if (!user) {
            alert('Please login to place an order');
            return;
        }

        try {
            // Get current product stock
            const productRef = firebase.firestore().collection('products').doc(productId);
            const productDoc = await productRef.get();
            
            if (!productDoc.exists) {
                alert('Product not found');
                return;
            }

            const currentStock = productDoc.data().stock || 0;
            if (currentStock < 1) {
                alert('Sorry, this product is out of stock');
                return;
            }

            // Create a batch write
            const batch = firebase.firestore().batch();

            // Create order
            const orderRef = firebase.firestore().collection('orders').doc();
            const formData = new FormData(e.target);
            const orderData = {
                productId: productId,
                productName: productName,
                price: productPrice,
                userId: user.uid,
                customerName: formData.get('customerName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                address: formData.get('address'),
                orderDate: new Date(),
                status: 'pending'
            };
            batch.set(orderRef, orderData);

            // Update product stock
            batch.update(productRef, {
                stock: currentStock - 1
            });

            // Commit both operations
            await batch.commit();

            // Show success modal
            const modal = document.getElementById('orderConfirmationModal');
            modal.style.display = 'flex';
            
            // Clear the form
            e.target.reset();
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Error placing order. Please try again.');
        }
    });
});

function redirectToOrders() {
    window.location.href = 'orders.html';
} 