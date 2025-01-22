// Handle admin login
async function handleAdminLogin(event) {
    event.preventDefault();
    console.log('Login attempt started');
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        console.log('Attempting to sign in with:', email);
        // Sign in with Firebase Auth
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        console.log('User signed in:', user.uid);

        // Check if user has admin role
        const userDoc = await db.collection('users').doc(user.uid).get();
        console.log('User doc:', userDoc.data());
        
        if (userDoc.exists && userDoc.data().role === 'admin') {
            console.log('Admin access granted');
            // Store admin status in session
            sessionStorage.setItem('isAdmin', 'true');
            // Successful admin login
            window.location.href = 'admin.html';
        } else {
            console.log('Not an admin user');
            // Not an admin
            await firebase.auth().signOut();
            showError('Access denied. Admin privileges required.');
        }
    } catch (error) {
        console.error("Login error:", error);
        showError('Invalid email or password');
    }
}

// Show error message
function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

// Only check auth state if we're on the login page
if (!window.location.pathname.includes('admin.html')) {
    firebase.auth().onAuthStateChanged(user => {
        if (user && sessionStorage.getItem('isAdmin') === 'true') {
            window.location.href = 'admin.html';
        }
    });
} 