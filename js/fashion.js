// Load products when the page loads
document.addEventListener('DOMContentLoaded', () => {
    displayProducts();
});

function displayProducts() {
    console.log("Starting to fetch fashion products");
    
    firebase.firestore().collection('products')
        .where('category', '==', 'fashion')
        .get()
        .then((querySnapshot) => {
            console.log("Got products:", querySnapshot.size);
            const productsContainer = document.querySelector('.Doctors-Section');
            productsContainer.innerHTML = '';

            querySnapshot.forEach((doc) => {
                const product = doc.data();
                const productCard = `
                    <div class="section-card1">
                        <div class="Im1" style="background-image: url('${product.imageUrl}');"></div>
                        <p class="name">${product.name}</p>
                        <p class="description">${product.description || 'No description available'}</p>
                        <p class="price">Price:<span>₹${product.price}</span></p>
                        <div class="product-buttons">
                            <button class="add-to-cart-btn" onclick="addToCart('${doc.id}', '${product.name}', ${product.price}, '${product.imageUrl}')">Add to Cart</button>
                            <button class="buy-now-btn" onclick="checkLoginAndProceedToBuy('${doc.id}', '${product.name}', ${product.price}, '${product.imageUrl}')">Buy Now</button>
                        </div>
                    </div>
                `;
                productsContainer.innerHTML += productCard;
            });
        })
        .catch((error) => {
            console.error("Error getting products:", error);
        });
}

function checkLoginAndProceedToBuy(productId, name, price, imageUrl) {
    const user = firebase.auth().currentUser;
    
    if (user) {
        // Encode the parameters to handle special characters
        const params = new URLSearchParams({
            productId: productId,
            name: name,
            price: price,
            imageUrl: imageUrl
        });
        window.location.href = `buy.html?${params.toString()}`;
    } else {
        showLoginPrompt();
    }
}

function showLoginPrompt() {
    const loginPrompt = document.createElement('div');
    loginPrompt.className = 'login-prompt';
    loginPrompt.innerHTML = `
        <div class="login-prompt-content">
            <h3>Login Required</h3>
            <p>Please login or create an account to continue shopping</p>
            <div class="login-prompt-buttons">
                <button onclick="window.location.href='login.html'">Login</button>
                <button onclick="window.location.href='register.html'">Create Account</button>
            </div>
            <button class="close-btn" onclick="closeLoginPrompt()">✕</button>
        </div>
    `;
    document.body.appendChild(loginPrompt);
}

function closeLoginPrompt() {
    const prompt = document.querySelector('.login-prompt');
    if (prompt) {
        prompt.remove();
    }
}

async function addToCart(productId, name, price, imageUrl) {
    const user = firebase.auth().currentUser;
    
    if (!user) {
        showLoginPrompt();
        return;
    }

    try {
        // Check if item already exists in cart
        const cartRef = firebase.firestore().collection('cart');
        const existingItem = await cartRef
            .where('userId', '==', user.uid)
            .where('productId', '==', productId)
            .get();

        if (!existingItem.empty) {
            // Update quantity if item exists
            const doc = existingItem.docs[0];
            await cartRef.doc(doc.id).update({
                quantity: firebase.firestore.FieldValue.increment(1)
            });
        } else {
            // Add new item to cart
            await cartRef.add({
                userId: user.uid,
                productId: productId,
                name: name,
                price: price,
                imageUrl: imageUrl,
                quantity: 1,
                addedAt: new Date()
            });
        }
        
        alert('Item added to cart!');
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Error adding item to cart');
    }
} 