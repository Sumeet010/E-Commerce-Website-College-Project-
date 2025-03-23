document.addEventListener('DOMContentLoaded', async () => {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('productId');
    const productName = urlParams.get('name');
    const productPrice = urlParams.get('price');
    const productImageUrl = urlParams.get('imageUrl');

    // Add debug logs
    console.log('URL Parameters:', {
        productId,
        productName,
        productPrice,
        productImageUrl
    });

    // Check if we have the required data
    if (!productName || !productPrice || !productImageUrl) {
        console.error('Missing product information');
        alert('Error: Product information is missing');
        return;
    }

    // Display product details
    document.getElementById('productName').textContent = productName;
    document.getElementById('productPrice').textContent = productPrice;
    document.getElementById('productImage').style.backgroundImage = `url('${decodeURIComponent(productImageUrl)}')`;

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

    // Payment method toggle
    const upiPaymentRadio = document.getElementById('upiPayment');
    const freeDeliveryRadio = document.getElementById('freeDelivery');
    const upiDetailsSection = document.getElementById('upiDetails');
    const transactionIdField = document.getElementById('transactionId');

    upiPaymentRadio.addEventListener('change', () => {
        if (upiPaymentRadio.checked) {
            upiDetailsSection.style.display = 'block';
            transactionIdField.setAttribute('required', 'required');
        }
    });

    freeDeliveryRadio.addEventListener('change', () => {
        if (freeDeliveryRadio.checked) {
            upiDetailsSection.style.display = 'none';
            transactionIdField.removeAttribute('required');
        }
    });

    // Initialize - make sure transaction ID is not required if COD is selected by default
    if (freeDeliveryRadio.checked) {
        transactionIdField.removeAttribute('required');
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

            // Get form data
            const formData = new FormData(e.target);
            const paymentMethod = formData.get('paymentMethod');

            // Validate transaction ID if UPI payment is selected
            if (paymentMethod === 'upi' && !formData.get('transactionId')) {
                alert('Please enter the UPI transaction ID after making payment');
                return;
            }

            // Create order
            const orderRef = firebase.firestore().collection('orders').doc();
            const orderData = {
                productId: productId,
                productName: productName,
                price: productPrice,
                userId: user.uid,
                customerName: formData.get('customerName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                address: formData.get('address'),
                paymentMethod: paymentMethod,
                paymentStatus: paymentMethod === 'free-delivery' ? 'confirmed' : 'awaiting verification',
                transactionId: paymentMethod === 'upi' ? formData.get('transactionId') : null,
                orderDate: new Date(),
                status: paymentMethod === 'free-delivery' ? 'processing' : 'pending'
            };
            batch.set(orderRef, orderData);

            // Update product stock
            batch.update(productRef, {
                stock: currentStock - 1
            });

            // Commit both operations
            await batch.commit();

            // Send email confirmation
            try {
                const emailData = {
                    orderId: orderRef.id,
                    productName: productName,
                    price: productPrice,
                    customerName: formData.get('customerName'),
                    email: formData.get('email'),
                    phone: formData.get('phone'),
                    address: formData.get('address'),
                    paymentMethod: paymentMethod === 'free-delivery' ? 'Cash on Delivery' : 'UPI Payment'
                };

                const response = await fetch('http://localhost:3002/send-order-confirmation', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ orderData: emailData })
                });

                if (!response.ok) {
                    console.error('Failed to send confirmation email');
                }
            } catch (emailError) {
                console.error('Error sending confirmation email:', emailError);
                // Continue with order success even if email fails
            }

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