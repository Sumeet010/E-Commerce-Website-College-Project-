// Remove all imports and just add the functions
function addDocument(collectionName, data) {
    return db.collection(collectionName).add(data);
}

function getAllDocuments(collectionName) {
    return db.collection(collectionName).get();
}

function getDocument(collectionName, documentId) {
    return db.collection(collectionName).doc(documentId).get();
}

function updateDocument(collectionName, documentId, data) {
    return db.collection(collectionName).doc(documentId).update(data);
}

function deleteDocument(collectionName, documentId) {
    return db.collection(collectionName).doc(documentId).delete();
}

// Query documents
export const queryDocuments = async (collectionName, field, operator, value) => {
    try {
        const q = query(collection(db, collectionName), where(field, operator, value));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error querying documents:", error);
        throw error;
    }
}; 