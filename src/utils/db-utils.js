import { database } from "../firebase.js"; // Only import the database instance
// Import the required RTDB functions individually
import { ref, push, set, update, remove, get, onValue } from "firebase/database"; 

// --- Hashing and Sanitization (Using Web Crypto API for SHA-256) ---
/**
 * Asynchronously hashes the password using SHA-256 (a cryptographic hash).
 */
async function hashPassword(password) {
    if (!password) return '';

    // Convert string to ArrayBuffer
    const msgUint8 = new TextEncoder().encode(password); 
    // Hash the message
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    // Convert ArrayBuffer to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
}

/**
 * Simple input sanitizer.
 */
function sanitizeInput(input) {
    if (!input) return '';
    // This is where the username is guaranteed to be clean for comparison
    return input.replace(/<[^>]*>?/gm, '').trim();
}
// --- End Hashing and Sanitization ---


/**
 * Searches RTDB for a user matching the provided username and password.
 * Reads from the publicly readable 'login_credentials' path 
 */
async function findUserForLogin(username, rawPassword) {
    // Read from the publicly readable credentials path
    const credentialsRef = ref(database, 'login_credentials'); 
    
    const hashedPassword = await hashPassword(rawPassword); 
    const sanitizedUsername = sanitizeInput(username);
    
    // Get all credentials (this path is publicly readable based on new rules)
    const snapshot = await get(credentialsRef); 
    if (!snapshot.exists()) {
        console.error("Database structure error: 'login_credentials' node does not exist at the root.");
        return null;
    }

    const credentialsData = snapshot.val();
    let foundUid = null;

    // Iterate to find matching username and password
    for (const uid in credentialsData) {
        const credential = credentialsData[uid];
        
        // CRITICAL CHECK: Ensure the sanitized username and the hashed password match the DB record
        if (credential.username === sanitizedUsername && 
            credential.hashed_password === hashedPassword && 
            credential.isActive) {
            
            foundUid = uid;
            break;
        }
    }
    
    // If credentials match, return a minimal user object containing the UID and role.
    if (foundUid) {
        const foundCredential = credentialsData[foundUid];
        
        // 2. Fetch the full user details from the protected /users node
        const userSnapshot = await get(ref(database, `users/${foundUid}`));
        if (userSnapshot.exists()) {
             return { 
                uid: foundUid, 
                role: foundCredential.role, 
                isActive: foundCredential.isActive,
                ...userSnapshot.val() // Return all user data like year, email, etc.
            };
        }

    }
    
    return null;
}

// --- Admin CRUD Operations ---

/**
 * Attaches a real-time listener to the /users node for all user records.
 * @param {function} callback - Function to execute with the user list when data changes.
 * @returns {function} An unsubscribe function to detach the listener.
 */
function onUsersChange(callback) {
    const usersRef = ref(database, 'users');
    
    // The onValue listener keeps the data synced in real-time
    const unsubscribe = onValue(usersRef, (snapshot) => {
        const usersData = snapshot.val();
        const userList = [];

        if (usersData) {
            // Convert the object of users into an array for React state management
            for (const uid in usersData) {
                userList.push({
                    id: uid, // Use Firebase UID as the user ID
                    ...usersData[uid]
                });
            }
        }
        // Call the callback with the new list of users
        callback(userList);
    }, (error) => {
        // Use console.error to log the error, but do not throw, as it will break the listener
        console.error("Firebase Realtime Listener Error:", error); 
    });

    return unsubscribe; // Return the function to detach the listener
}


/**
 * Adds a new user record to the RTDB and populates the public login_credentials node.
 */
async function addUser(userData) {
    const { rawPassword, ...rest } = userData;
    const usersRef = ref(database, 'users');
    // Using push to generate a unique key
    const newUserId = push(usersRef).key; 

    const hashedPassword = await hashPassword(rawPassword);
    const date_created = new Date().toISOString();

    const newUser = {
        ...rest,
        hashed_password: hashedPassword,
        username: sanitizeInput(userData.username),
        createdAt: date_created, 
        isActive: true
    };
    
    const updates = {};
    // 1. Update the protected /users node
    updates[`users/${newUserId}`] = newUser;
    
    // 2. Update the public /login_credentials node
    updates[`login_credentials/${newUserId}`] = {
        username: newUser.username,
        hashed_password: hashedPassword,
        isActive: newUser.isActive,
        role: newUser.role 
    };
    
    // This multi-path update needs authentication to be successful
    await update(ref(database), updates); 
    return newUserId;
}

/**
 * Updates an existing user record in the RTDB and the public login_credentials node.
 */
async function updateUser(uid, userData) {
    const { rawPassword, ...rest } = userData;
    const updates = {
        ...rest,
        username: sanitizeInput(userData.username),
    };

    if (rawPassword) {
        updates.hashed_password = await hashPassword(rawPassword); 
    }

    const multiPathUpdates = {};
    
    // 1. Update the protected /users node
    multiPathUpdates[`users/${uid}`] = updates;

    // 2. Update the public /login_credentials node (only update fields that exist there)
    if (updates.hashed_password) {
        multiPathUpdates[`login_credentials/${uid}/hashed_password`] = updates.hashed_password;
    }
    if (updates.username) {
        multiPathUpdates[`login_credentials/${uid}/username`] = updates.username;
    }
    if (updates.isActive !== undefined) {
        multiPathUpdates[`login_credentials/${uid}/isActive`] = updates.isActive;
    }
    if (updates.role) {
        multiPathUpdates[`login_credentials/${uid}/role`] = updates.role;
    }


    await update(ref(database), multiPathUpdates);
}

/**
 * Deletes a user record from the RTDB and the public login_credentials node.
 */
async function deleteUser(uid) {
    const updates = {};
    updates[`users/${uid}`] = null;
    updates[`login_credentials/${uid}`] = null;
    
    await update(ref(database), updates);
}

// Toggling active status
async function toggleUserStatus(uid, isActive) {
    const updates = {};
    updates[`users/${uid}/isActive`] = isActive;
    updates[`login_credentials/${uid}/isActive`] = isActive;
    
    await update(ref(database), updates);
}


export const dbUtils = {
    hashPassword, 
    sanitizeInput,
    findUserForLogin,
    onUsersChange, 
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus
};
