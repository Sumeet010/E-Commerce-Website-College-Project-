document.addEventListener('DOMContentLoaded', () => {
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

    // Handle form submission
    document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const user = firebase.auth().currentUser;
        if (!user) {
            alert('Please login to place an order');
            return;
        }

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

        try {
            await firebase.firestore().collection('orders').add(orderData);
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