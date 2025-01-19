// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";
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
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("User registered:", userCredential.user);
        alert("User registered successfully");
        window.location.href = "../index.html";
    } catch (error) {
        console.error("Registration error:", error);
        alert("Registration error: " + error.message);
    }
});
