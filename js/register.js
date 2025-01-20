// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBRjErGqq3UkKl64rNCR5_RvcwcwN6NaVM",
  authDomain: "login-ede06.firebaseapp.com",
  projectId: "login-ede06",
  storageBucket: "login-ede06.firebasestorage.app",
  messagingSenderId: "216423877093",
  appId: "1:216423877093:web:878f9451d74f080015870c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const submit = document.getElementById('submit');

submit.addEventListener('click', async function(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        await registerUser(email, password);
    } catch (error) {
        console.error("Registration error:", error);
        alert("Registration error: " + error.message);
    }
});

async function registerUser(email, password) {
    try {
        // Create user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Send verification email
        await sendEmailVerification(user);
        alert("Please check your email and click the verification link.");

        // Start checking for verification
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Force refresh the token to get the latest email verification status
                await user.reload();
                
                if (user.emailVerified) {
                    alert("Email verified successfully! Redirecting to homepage...");
                    unsubscribe(); // Stop listening for changes
                    window.location.href = '../index.html'; // Redirect directly to index.html
                }
            }
        });

        // Optional: Set a timeout for verification check
        setTimeout(() => {
            unsubscribe();
            alert("Email verification timeout. Please verify your email and login manually.");
            window.location.href = 'login.html';
        }, 300000); // 5 minutes timeout

    } catch (error) {
        console.error("Error during registration:", error);
        alert(error.message);
    }
}

// In your login function, add email verification check
async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (!user.emailVerified) {
            alert("Please verify your email before logging in.");
            await signOut(auth); // Sign out the unverified user
            return;
        }

        // If email is verified, proceed with login
        alert("Login successful!");
        window.location.href = '../index.html'; // Redirect to home page

    } catch (error) {
        console.error("Error during login:", error);
        alert(error.message);
    }
}
