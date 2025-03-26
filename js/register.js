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

// Custom notification function
function showNotification(message, type = 'error') {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Add to document
    document.body.appendChild(notification);

    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.5s forwards';
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 5000);
}

// Password validation function
function validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];
    
    if (password.length < minLength) {
        errors.push(`Password must be at least ${minLength} characters long`);
    }
    if (!hasUpperCase) {
        errors.push("Password must contain at least one uppercase letter");
    }
    if (!hasLowerCase) {
        errors.push("Password must contain at least one lowercase letter");
    }
    if (!hasNumbers) {
        errors.push("Password must contain at least one number");
    }
    if (!hasSpecialChar) {
        errors.push("Password must contain at least one special character");
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// Add password requirements display
function createPasswordRequirements() {
    const requirementsDiv = document.createElement('div');
    requirementsDiv.className = 'password-requirements';
    requirementsDiv.innerHTML = `
        <p style="font-size: 14px; color: #666; margin-top: 5px;">Password must contain:</p>
        <ul style="font-size: 12px; color: #666; margin-left: 20px;">
            <li id="length">At least 8 characters</li>
            <li id="uppercase">At least one uppercase letter</li>
            <li id="lowercase">At least one lowercase letter</li>
            <li id="number">At least one number</li>
            <li id="special">At least one special character</li>
        </ul>
    `;
    
    const passwordInput = document.getElementById('password');
    passwordInput.parentNode.insertBefore(requirementsDiv, passwordInput.nextSibling);

    // Add real-time password validation
    passwordInput.addEventListener('input', function(e) {
        const password = e.target.value;
        updatePasswordRequirements(password);
    });
}

// Update password requirements in real-time
function updatePasswordRequirements(password) {
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    Object.keys(requirements).forEach(req => {
        const element = document.getElementById(req);
        if (element) {
            element.style.color = requirements[req] ? '#00C851' : '#666';
            element.style.fontWeight = requirements[req] ? 'bold' : 'normal';
        }
    });
}

// Create password requirements display when page loads
document.addEventListener('DOMContentLoaded', createPasswordRequirements);

const submit = document.getElementById('submit');

submit.addEventListener('click', async function(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Validate password before registration
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        showNotification(passwordValidation.errors.join('\n'), 'error');
        return;
    }
    
    try {
        await registerUser(email, password);
    } catch (error) {
        console.error("Registration error:", error);
        showNotification("Registration error: " + error.message);
    }
});

async function registerUser(email, password) {
    try {
        // Create user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Send verification email
        await sendEmailVerification(user);
        showNotification("Please check your email and click the verification link.", "success");

        // Create verification status modal
        createVerificationModal(email);

        // Start checking for verification
        startVerificationCheck(user);

    } catch (error) {
        console.error("Error during registration:", error);
        showNotification(error.message, "error");
    }
}

// Function to actively check verification status
function startVerificationCheck(user) {
    let verificationCheckInterval;
    let timeoutTimer;
    
    // Function to update status in the modal
    const updateStatus = (message, isVerified = false) => {
        const statusElement = document.querySelector('.verification-status');
        if (statusElement) {
            statusElement.textContent = message;
            
            if (isVerified) {
                statusElement.style.color = '#00C851';
                
                // Change spinner to checkmark
                const loader = document.querySelector('.verification-loader');
                if (loader) {
                    loader.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00C851" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
                }
            }
        }
    };
    
    // Function to clean up timers
    const cleanUp = () => {
        if (verificationCheckInterval) clearInterval(verificationCheckInterval);
        if (timeoutTimer) clearTimeout(timeoutTimer);
    };
    
    // Set up interval to check verification status every 3 seconds
    verificationCheckInterval = setInterval(async () => {
        try {
            // Force refresh the token to get the latest email verification status
            await user.reload();
            
            if (user.emailVerified) {
                updateStatus("Email verified successfully! Redirecting...", true);
                cleanUp();
                
                // Redirect after a short delay
                setTimeout(() => {
                    showNotification("Email verified successfully! Redirecting to homepage...", "success");
                    
                    // Remove verification modal if exists
                    const modal = document.getElementById('verification-modal');
                    if (modal) {
                        modal.style.animation = 'fadeOut 0.5s forwards';
                        setTimeout(() => modal.remove(), 500);
                    }
                    
                    // Redirect after a short delay
                    setTimeout(() => {
                        window.location.href = '../index.html';
                    }, 1500);
                }, 1500);
            }
        } catch (error) {
            console.error("Error checking verification status:", error);
        }
    }, 3000);
    
    // Set timeout for verification check (5 minutes)
    timeoutTimer = setTimeout(() => {
        cleanUp();
        updateStatus("Verification timeout. Please verify your email and login manually.");
        
        showNotification("Email verification timeout. Please verify your email and login manually.", "error");
        
        // Add a button to resend verification email
        const modalContent = document.querySelector('.verification-modal-content');
        if (modalContent) {
            const resendButton = document.createElement('button');
            resendButton.className = 'verification-resend-btn';
            resendButton.textContent = 'Resend Verification Email';
            resendButton.style.marginRight = '10px';
            resendButton.addEventListener('click', async () => {
                try {
                    await sendEmailVerification(user);
                    showNotification("Verification email resent. Please check your inbox.", "success");
                } catch (error) {
                    showNotification("Error resending verification email: " + error.message, "error");
                }
            });
            
            // Find the close button and insert the resend button before it
            const closeButton = modalContent.querySelector('.verification-close-btn');
            if (closeButton) {
                modalContent.insertBefore(resendButton, closeButton);
            } else {
                modalContent.appendChild(resendButton);
            }
        }
        
        // Redirect after a delay
        setTimeout(() => {
            // Remove verification modal if exists
            const modal = document.getElementById('verification-modal');
            if (modal) modal.remove();
            
            window.location.href = 'login.html';
        }, 10000); // 10 seconds
    }, 300000); // 5 minutes
    
    // Listen for auth state changes (in case user verifies in another tab)
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser && currentUser.uid === user.uid) {
            // Force refresh the token
            await currentUser.reload();
            
            if (currentUser.emailVerified) {
                updateStatus("Email verified successfully! Redirecting...", true);
                unsubscribe();
                cleanUp();
                
                // Redirect after a short delay
                setTimeout(() => {
                    showNotification("Email verified successfully! Redirecting to homepage...", "success");
                    
                    // Remove verification modal if exists
                    const modal = document.getElementById('verification-modal');
                    if (modal) {
                        modal.style.animation = 'fadeOut 0.5s forwards';
                        setTimeout(() => modal.remove(), 500);
                    }
                    
                    // Redirect after a short delay
                    setTimeout(() => {
                        window.location.href = '../index.html';
                    }, 1500);
                }, 1500);
            }
        }
    });
}

// Create a modal to show verification status
function createVerificationModal(email) {
    // Remove existing modal if any
    const existingModal = document.getElementById('verification-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal container
    const modal = document.createElement('div');
    modal.id = 'verification-modal';
    modal.className = 'verification-modal';
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'verification-modal-content';
    
    // Add email icon
    const emailIcon = document.createElement('div');
    emailIcon.className = 'email-icon';
    emailIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm17 4.238l-7.928 7.1L4 7.216V19h16V7.238zM4.511 5l7.55 6.662L19.502 5H4.511z" fill="#0f1060"/></svg>';
    
    // Add message
    const message = document.createElement('h3');
    message.textContent = 'Verify Your Email';
    
    // Add description
    const description = document.createElement('p');
    description.innerHTML = `We've sent a verification link to <strong>${email}</strong>.<br>Please check your inbox and click the link to verify your account.`;
    
    // Add loading indicator
    const loader = document.createElement('div');
    loader.className = 'verification-loader';
    loader.innerHTML = '<div class="verification-spinner"></div>';
    
    // Add status text
    const status = document.createElement('p');
    status.className = 'verification-status';
    status.textContent = 'Waiting for verification...';
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.className = 'verification-close-btn';
    closeButton.textContent = 'Login Later';
    closeButton.addEventListener('click', () => {
        modal.style.animation = 'fadeOut 0.5s forwards';
        setTimeout(() => {
            modal.remove();
            window.location.href = 'login.html';
        }, 500);
    });
    
    // Assemble modal
    modalContent.appendChild(emailIcon);
    modalContent.appendChild(message);
    modalContent.appendChild(description);
    modalContent.appendChild(loader);
    modalContent.appendChild(status);
    modalContent.appendChild(closeButton);
    modal.appendChild(modalContent);
    
    // Add to document
    document.body.appendChild(modal);
}

// In your login function, add email verification check
async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (!user.emailVerified) {
            showNotification("Please verify your email before logging in.", "error");
            await signOut(auth); // Sign out the unverified user
            return;
        }

        // If email is verified, proceed with login
        showNotification("Login successful!", "success");
        
        // Redirect after a short delay
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 2000);

    } catch (error) {
        console.error("Error during login:", error);
        showNotification(error.message, "error");
    }
}
