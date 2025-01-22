import { createUserProfile, getUserProfile, updateUserProfile } from "./user-service.js";
import { auth } from "./firebase-config.js";

// Example: Create user profile after registration
async function afterUserRegistration(userData) {
    try {
        await createUserProfile({
            name: userData.name,
            email: userData.email,
            // other user data
        });
    } catch (error) {
        console.error("Error in after registration:", error);
    }
}

// Example: Get user profile
async function loadUserProfile() {
    try {
        const userId = auth.currentUser.uid;
        const userProfile = await getUserProfile(userId);
        // Use the profile data
        console.log(userProfile);
    } catch (error) {
        console.error("Error loading profile:", error);
    }
}

// Example: Update user profile
async function updateProfile(newData) {
    try {
        const userId = auth.currentUser.uid;
        await updateUserProfile(userId, newData);
        alert("Profile updated successfully!");
    } catch (error) {
        console.error("Error updating profile:", error);
    }
} 