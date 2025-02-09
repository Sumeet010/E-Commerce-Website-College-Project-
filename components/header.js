class Header extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
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
                    gap: 10px;
                    margin-left: auto;
                }

                .auth-buttons button {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.3s ease;
                }

                .login-btn {
                    background-color: #161880;
                    color: white;
                }

                .signup-btn {
                    border-radius: 10px;
                    background-color: #ff4444;
                    color: white;
                }

                .login-btn:hover {
                    background-color: #0f1060;
                }

                .signup-btn:hover {
                    background-color: #ff2020;
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
                            <li>
                                <a href="${window.location.pathname.includes('/pages/') ? '../' : ''}index.html">&#127968; Home</a>
                                <a href="">&#128176; Deals</a>
                                <a href="">&#128722; Shop</a>
                                <a href="">&#127873; Today's offer</a>
                            </li>
                        </ul>
                    </nav>
                    <div id="loginSection" class="auth-buttons">
                        <!-- This will be dynamically updated -->
                    </div>
                </div>
                <div class="items">
                    <nav>
                        <ul>
                            <li>
                                <a href="${window.location.pathname.includes('/pages/') ? '' : 'pages/'}Electronics.html">&#128241; Electronics</a>
                                <a href="${window.location.pathname.includes('/pages/') ? '' : 'pages/'}Fashion.html">&#128087; Fashion</a>
                                <a href="${window.location.pathname.includes('/pages/') ? '' : 'pages/'}Grocery.html">&#128722; Grocery</a>
                                <a href="${window.location.pathname.includes('/pages/') ? '' : 'pages/'}Home.html">&#128716; Home & Furniture</a>
                                <a href="${window.location.pathname.includes('/pages/') ? '' : 'pages/'}Toys.html">&#127879; Toys & Kid Accessories</a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        `;

        // Check authentication state
        firebase.auth().onAuthStateChanged((user) => {
            const loginSection = document.getElementById('loginSection');
            if (user) {
                loginSection.innerHTML = `
                    <div class="welcome-user">
                        <span>Welcome, ${user.email}</span>
                        <button class="signup-btn" onclick="handleLogout()">Logout</button>
                    </div>
                `;
            } else {
                // Get the current path
                const currentPath = window.location.pathname;
                // Determine if we're in the pages directory
                const isInPagesDir = currentPath.includes('/pages/');
                // Set the login path accordingly
                const loginPath = isInPagesDir ? './login.html' : './pages/login.html';
                
                loginSection.innerHTML = `
                    <button class="login-btn" onclick="window.location.href='${loginPath}'">Login</button>
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