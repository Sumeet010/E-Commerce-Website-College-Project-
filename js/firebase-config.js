// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBRjErGqq3UkKl64rNCR5_RvcwcwN6NaVM",
    authDomain: "login-ede06.firebaseapp.com",
    projectId: "login-ede06",
    storageBucket: "login-ede06.firebasestorage.app",
    messagingSenderId: "216423877093",
    appId: "1:216423877093:web:878f9451d74f080015870c"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get references to Firebase services
const db = firebase.firestore();
const auth = firebase.auth(); 