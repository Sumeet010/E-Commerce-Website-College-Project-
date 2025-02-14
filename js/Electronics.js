function createProductCard(product) {
    const isOutOfStock = product.stock === 0;
    return `
        <div class="section-card1">
            <div class="Im1" style="background-image: url('${product.imageUrl}')"></div>
            <h2 class="name">${product.name}</h2>
            <p class="price">Price: <span>₹${product.price}</span></p>
            <button 
                onclick="addToCart('${product.id}', '${product.name}', ${product.price}, '${product.imageUrl}')"
                ${isOutOfStock ? 'disabled' : ''}
                class="add-to-cart-btn">
                <i class="fas fa-shopping-cart"></i> 
                ${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
        </div>
    `;
}

async function loadProducts() {
    const productsContainer = document.getElementById('productsContainer');
    
    try {
        const snapshot = await firebase.firestore()
            .collection('products')
            .where('category', '==', 'electronics')
            .get();

        productsContainer.innerHTML = '';
        
        snapshot.forEach(doc => {
            const product = { 
                id: doc.id,
                ...doc.data()
            };
            
            productsContainer.innerHTML += `
                <div class="section-card1">
                    <div class="Im1" style="background-image: url('${product.imageUrl}')"></div>
                    <h2 class="name">${product.name}</h2>
                    <p class="price">Price: <span>₹${product.price}</span></p>
                    <button onclick="addToCart('${product.id}', '${product.name}', ${product.price}, '${product.imageUrl}')"
                            class="add-to-cart-btn">
                        Add to Cart
                    </button>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error loading products:', error);
        productsContainer.innerHTML = '<p>Error loading products. Please try again later.</p>';
    }
}

async function addToCart(productId, name, price, imageUrl) {
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        // Check stock before adding to cart
        const productDoc = await firebase.firestore()
            .collection('products')
            .doc(productId)
            .get();

        if (!productDoc.exists) {
            alert('Product not found');
            return;
        }

        const currentStock = productDoc.data().stock || 0;
        if (currentStock === 0) {
            alert('Sorry, this item is out of stock');
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
            const cart = cartDoc.data();
            const existingItem = cart.items.find(item => item.productId === productId);

            if (existingItem) {
                // Check if adding more would exceed stock
                if (existingItem.quantity >= currentStock) {
                    alert('Sorry, no more stock available');
                    return;
                }
                existingItem.quantity += 1;
                await cartRef.update({ items: cart.items });
            } else {
                cart.items.push({
                    productId,
                    name,
                    price,
                    imageUrl,
                    quantity: 1
                });
                await cartRef.update({ items: cart.items });
            }
        }

        alert('Product added to cart!');
        
        // Refresh the products display
        loadProducts();
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Error adding to cart');
    }
}

// Load products when page loads
document.addEventListener('DOMContentLoaded', loadProducts); 