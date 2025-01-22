import { addDocument, getDocument, updateDocument, queryDocuments } from "./db-service.js";
import { auth } from "./firebase-config.js";

const USERS_COLLECTION = "users";

export const createUserProfile = async (userData) => {
    try {
        const userId = auth.currentUser.uid;
        await addDocument(USERS_COLLECTION, {
            uid: userId,
            ...userData,
            createdAt: new Date().toISOString()
        });
        return userId;
    } catch (error) {
        console.error("Error creating user profile:", error);
        throw error;
    }
};

export const getUserProfile = async (userId) => {
    try {
        const users = await queryDocuments(USERS_COLLECTION, "uid", "==", userId);
        return users[0] || null;
    } catch (error) {
        console.error("Error getting user profile:", error);
        throw error;
    }
};

export const updateUserProfile = async (userId, userData) => {
    try {
        const users = await queryDocuments(USERS_COLLECTION, "uid", "==", userId);
        if (users.length > 0) {
            await updateDocument(USERS_COLLECTION, users[0].id, userData);
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
}; 