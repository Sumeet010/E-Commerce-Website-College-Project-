document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            loadCartItems();
        } else {
            // Store the current page URL before redirecting
            sessionStorage.setItem('returnUrl', window.location.href);
            window.location.href = 'login.html';
        }
    });
});

async function loadCartItems() {
    const user = firebase.auth().currentUser;
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    try {
        const snapshot = await firebase.firestore()
            .collection('cart')
            .where('userId', '==', user.uid)
            .get();

        cartItems.innerHTML = '';
        let total = 0;

        if (snapshot.empty) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <p>Your cart is empty</p>
                    <a href="Electronics.html" class="continue-shopping">Continue Shopping</a>
                </div>
            `;
            cartTotal.textContent = '₹0';
            return;
        }

        snapshot.forEach(doc => {
            const item = doc.data();
            total += parseFloat(item.price) * item.quantity;
            
            const itemElement = `
                <div class="cart-item">
                    <div class="cart-item-image" style="background-image: url('${item.imageUrl}')"></div>
                    <div class="cart-item-details">
                        <h3>${item.name}</h3>
                        <p>Price: ₹${item.price}</p>
                        <div class="quantity-controls">
                            <button onclick="updateQuantity('${doc.id}', ${item.quantity - 1})" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                            <span>${item.quantity}</span>
                            <button onclick="updateQuantity('${doc.id}', ${item.quantity + 1})">+</button>
                        </div>
                    </div>
                    <button class="remove-button" onclick="removeFromCart('${doc.id}')">Remove</button>
                </div>
            `;
            
            cartItems.innerHTML += itemElement;
        });

        cartTotal.textContent = `₹${total.toFixed(2)}`;
        
        // Enable/disable checkout button based on cart items
        const checkoutButton = document.getElementById('checkoutButton');
        if (checkoutButton) {
            checkoutButton.disabled = snapshot.empty;
        }

    } catch (error) {
        console.error('Error loading cart:', error);
        cartItems.innerHTML = `
            <div class="error-message">
                <p>Error loading cart items. Please try again later.</p>
            </div>
        `;
    }
}

async function updateQuantity(cartItemId, newQuantity) {
    if (newQuantity < 1) return;

    try {
        await firebase.firestore()
            .collection('cart')
            .doc(cartItemId)
            .update({
                quantity: newQuantity
            });
        loadCartItems(); // Reload cart to show updated quantities
    } catch (error) {
        console.error('Error updating quantity:', error);
        alert('Error updating quantity');
    }
}

async function removeFromCart(cartItemId) {
    try {
        await firebase.firestore()
            .collection('cart')
            .doc(cartItemId)
            .delete();
        loadCartItems(); // Reload cart after removing item
        
        // Update cart count in header
        const user = firebase.auth().currentUser;
        if (user) {
            const header = document.querySelector('my-header');
            if (header) {
                header.updateCartCount(user.uid);
            }
        }
    } catch (error) {
        console.error('Error removing item:', error);
        alert('Error removing item from cart');
    }
}

function proceedToCheckout() {
    // Implement checkout logic here
    window.location.href = 'checkout.html';
} 