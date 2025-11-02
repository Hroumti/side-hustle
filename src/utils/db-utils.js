import { database, ref, push, set, update, remove, get } from "../firebase.js";

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
    return input.replace(/<[^>]*>?/gm, '').trim();
}
// --- End Hashing and Sanitization ---


/**
 * Searches RTDB for a user matching the provided username and password.
 * FIX: Reads from the publicly readable 'login_credentials' path 
 * to bypass the permission error during the unauthenticated login attempt.
 */
async function findUserForLogin(username, rawPassword) {
    // Read from the publicly readable credentials path
    const credentialsRef = ref(database, 'login_credentials'); 
    
    const hashedPassword = await hashPassword(rawPassword); 
    const sanitizedUsername = sanitizeInput(username);
    console.log(hashedPassword)
    // Get all credentials (this path is publicly readable based on new rules)
    const snapshot = await get(credentialsRef); 
    if (!snapshot.exists()) {
        return null;
    }

    const credentialsData = snapshot.val();
    let foundUid = null;

    // Iterate to find matching username and password
    for (const uid in credentialsData) {
        const credential = credentialsData[uid];
        
        if (credential.username === sanitizedUsername && 
            credential.hashed_password === hashedPassword && 
            credential.isActive) {
            
            foundUid = uid;
            break;
        }
    }
    
    // If credentials match, return a minimal user object containing the UID and role.
    // context.jsx will use this UID to establish the user state.
    if (foundUid) {
        const foundCredential = credentialsData[foundUid];

        return { 
            uid: foundUid, 
            role: foundCredential.role, // Temporarily use role from public node
            isActive: foundCredential.isActive
        };
    }
    
    return null;
}

// --- Admin CRUD Operations ---

/**
 * Adds a new user record to the RTDB and populates the public login_credentials node.
 */
async function addUser(userData) {
    const { rawPassword, ...rest } = userData;
    const usersRef = ref(database, 'users');
    const newUserId = push(usersRef).key; 

    const hashedPassword = await hashPassword(rawPassword);
    const date_created = new Date().toISOString();

    const newUser = {
        ...rest,
        hashed_password: hashedPassword,
        username: sanitizeInput(userData.username),
        date_created: date_created,
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
        role: newUser.role // Store role here to return a full user object from findUserForLogin
    };
    
    await update(ref(database), updates); // Multi-path update
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
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus
};
