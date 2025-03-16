class Header extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        // Check if we're in the root directory or in a subdirectory
        const isRoot = window.location.pathname === '/' || window.location.pathname.endsWith('index.html');

        const styles = `
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                .navbar {
                    display: flex;
                    align-items: center;
                    padding: 20px;
                    height: 50px;
                    width: 100%;
                    background-color: white;
                }

                nav {
                    flex: 1;
                    text-align: center;
                }

                nav ul {
                    display: inline-block;
                    list-style-type: none;   
                }

                nav ul li {
                    display: inline-block;
                    margin-right: 20px;
                }

                nav ul li a {
                    text-decoration: none;
                    color: #262626;
                    font-weight: 500;
                }

                .items {
                    background-color: #161880;
                    padding: 20px 25px;
                    width: 100%;
                }

                .items a {
                    color: white;
                    text-decoration: none;
                    margin-right: 20px;
                }

                .auth-buttons {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    margin-left: auto;
                    padding-right: 20px;
                }

                .auth-buttons button {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.3s ease;
                }

                .login-btn, .register-btn {
                    text-decoration: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    font-weight: 500;
                    transition: all 0.3s ease;
                }

                .login-btn {
                    background-color: transparent;
                    color: #161880;
                    border: 1px solid #161880;
                }

                .register-btn {
                    background-color: #161880;
                    color: white;
                    border: none;
                }

                .login-btn:hover {
                    background-color: #f0f0ff;
                }

                .register-btn:hover {
                    background-color: #0f1060;
                }

                .welcome-user {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .welcome-user span {
                    color: #161880;
                    font-weight: 500;
                }

                .view-orders-btn, .cart-btn {
                    padding: 8px 16px;
                    background-color: #161880;
                    color: white;
                    border-radius: 5px;
                    text-decoration: none;
                    font-size: 14px;
                    transition: background-color 0.3s ease;
                }

                .view-orders-btn:hover, .cart-btn:hover {
                    background-color: #0f0f60;
                }

                .logout-btn {
                    padding: 8px 16px;
                    background-color: #ff4444;
                    color: white;
                }

                @media (max-width: 768px) {
                    .navbar {
                        padding: 10px;
                    }

                    .auth-buttons button {
                        padding: 6px 12px;
                        font-size: 14px;
                    }

                    .items {
                        padding: 15px;
                    }

                    .items a {
                        margin-right: 10px;
                        font-size: 14px;
                    }
                }
            </style>
        `;

        this.innerHTML = `
            ${styles}
            <div class="container">
                <div class="navbar">
                    <nav>
                        <ul>
                            <li><a href="${isRoot ? '' : '../'}index.html">Home</a></li>
                            <li><a href="${isRoot ? 'pages/' : ''}Electronics.html">Electronics</a></li>
                            <li><a href="${isRoot ? 'pages/' : ''}Fashion.html">Fashion</a></li>
                            <li><a href="${isRoot ? 'pages/' : ''}Grocery.html">Grocery</a></li>
                            <li><a href="${isRoot ? 'pages/' : ''}Home.html">Home</a></li>
                            <li><a href="${isRoot ? 'pages/' : ''}Toys.html">Toys</a></li>
                        </ul>
                    </nav>
                    <div id="loginSection" class="auth-buttons">
                        <div id="orderButton" style="display: none;">
                            <a href="${isRoot ? 'pages/' : ''}orders.html" class="view-orders-btn">View Orders</a>
                        </div>
                        <div id="cartButton" style="display: none;">
                            <a href="${isRoot ? 'pages/' : ''}cart.html" class="cart-btn">Cart</a>
                        </div>
                        <div id="authSection">
                            <!-- Auth buttons will be inserted here -->
                        </div>
                    </div>
                </div>
                <div class="items">
                    <nav>
                        <a href="${isRoot ? 'pages/' : ''}Electronics.html">&#128241; Electronics</a>
                        <a href="${isRoot ? 'pages/' : ''}Fashion.html">&#128087; Fashion</a>
                        <a href="${isRoot ? 'pages/' : ''}Grocery.html">&#128722; Grocery</a>
                        <a href="${isRoot ? 'pages/' : ''}Home.html">&#128716; Home & Furniture</a>
                        <a href="${isRoot ? 'pages/' : ''}Toys.html">&#127879; Toys & Kid Accessories</a>
                    </nav>
                </div>
            </div>
        `;

        // Check authentication state
        firebase.auth().onAuthStateChanged(user => {
            const orderButton = this.querySelector('#orderButton');
            const cartButton = this.querySelector('#cartButton');
            const authSection = this.querySelector('#authSection');

            if (user) {
                orderButton.style.display = 'block';
                cartButton.style.display = 'block';
                authSection.innerHTML = `
                    <div class="welcome-user">
                        <span>Welcome, ${user.email}</span>
                        <button onclick="handleLogout()" class="logout-btn">Logout</button>
                    </div>
                `;
            } else {
                orderButton.style.display = 'none';
                cartButton.style.display = 'none';
                authSection.innerHTML = `
                    <a href="${isRoot ? 'pages/' : ''}login.html" class="login-btn">Login</a>
                    <a href="${isRoot ? 'pages/' : ''}register.html" class="register-btn">Register</a>
                `;
            }
        });
    }
}

function handleLogout() {
    firebase.auth().signOut()
        .then(() => {
            window.location.href = window.location.pathname.includes('/pages/') ? '../index.html' : 'index.html';
        })
        .catch((error) => {
            console.error('Error logging out:', error);
        });
}

customElements.define('my-header', Header);