// Load products when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});

async function loadProducts() {
    const productsContainer = document.querySelector('.Doctors-Section');
    
    try {
        const snapshot = await firebase.firestore()
            .collection('products')
            .where('category', '==', 'fashion')
            .get();

        productsContainer.innerHTML = '';
        
        snapshot.forEach(doc => {
            const product = { 
                id: doc.id,
                ...doc.data()
            };
            
            const productCard = `
                <div class="section-card1">
                    <div class="Im1" style="background-image: url('${product.imageUrl}');"></div>
                    <p class="name">${product.name}</p>
                    <p class="description">${product.description || 'No description available'}</p>
                    <p class="price">Price:<span>₹${product.price}</span></p>
                    <div class="product-buttons">
                        <button class="add-to-cart-btn" onclick="addToCart('${doc.id}', '${product.name}', ${product.price}, '${product.imageUrl}')">Add to Cart</button>
                        <button class="buy-now-btn" onclick="proceedToBuy('${doc.id}', '${product.name}', ${product.price}, '${product.imageUrl}')">Buy Now</button>
                    </div>
                </div>
            `;
            
            productsContainer.innerHTML += productCard;
        });
    } catch (error) {
        console.error('Error loading products:', error);
        productsContainer.innerHTML = '<p>Error loading products. Please try again later.</p>';
    }
}

function proceedToBuy(productId, name, price, imageUrl) {
    // Check if user is logged in
    const user = firebase.auth().currentUser;
    if (!user) {
        alert('Please login to continue with purchase');
        window.location.href = 'login.html';
        return;
    }

    // Redirect to buy page with product details
    const queryParams = new URLSearchParams({
        productId: productId,
        name: name,
        price: price,
        imageUrl: imageUrl
    });
    window.location.href = `buy.html?${queryParams.toString()}`;
}

async function addToCart(productId, name, price, imageUrl) {
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        const cartRef = firebase.firestore().collection('cart').doc(user.uid);
        const cartDoc = await cartRef.get();

        if (!cartDoc.exists) {
            await cartRef.set({
                items: [{
                    productId,
                    name,
                    price,
                    imageUrl,
                    quantity: 1
                }]
            });
        } else {
            const cartData = cartDoc.data();
            const existingItemIndex = cartData.items.findIndex(item => item.productId === productId);

            if (existingItemIndex > -1) {
                cartData.items[existingItemIndex].quantity += 1;
            } else {
                cartData.items.push({
                    productId,
                    name,
                    price,
                    imageUrl,
                    quantity: 1
                });
            }

            await cartRef.update({
                items: cartData.items
            });
        }

        alert('Item added to cart successfully!');
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Error adding item to cart');
    }
} 