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
 * Enhanced input sanitizer with security checks.
 */
function sanitizeInput(input) {
    if (!input) return '';
    
    // Enhanced sanitization for usernames
    return input
        .replace(/[^a-zA-Z0-9_-]/g, '') // Only allow alphanumeric, underscore, hyphen
        .replace(/<[^>]*>?/gm, '') // Remove HTML tags
        .trim()
        .substring(0, 20); // Limit length
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
            credential.isActive !== false) {
            
            foundUid = uid;
            break;
        }
    }
    
    // If credentials match, return a minimal user object containing the UID and role.
    // Note: We don't fetch from /users here because it requires auth, and we haven't authenticated yet
    // The user details will be fetched after authentication if needed
    if (foundUid) {
        const foundCredential = credentialsData[foundUid];
        
        // Return user data from login_credentials (which has role and isActive)
        // Additional user details can be fetched after authentication
        return { 
            uid: foundUid, 
            role: foundCredential.role, 
            isActive: foundCredential.isActive,
            username: foundCredential.username
        };
    }
    
    return null;
}

// --- Admin CRUD Operations ---

/**
 * Attaches a real-time listener to the /users node for all user records.
 * @param {function} callback - Function to execute with the user list when data changes.
 * @returns {function} An unsubscribe function to detach the listener.
 */
function onUsersChange(callback, errorCallback) {
    const usersRef = ref(database, 'users');
    
    // The onValue listener keeps the data synced in real-time
    const unsubscribe = onValue(usersRef, (snapshot) => {
        const usersData = snapshot.val();
        const userList = [];

        if (usersData) {
            // Convert the object of users into an array for React state management
            for (const uid in usersData) {
                userList.push({
                    uid: uid, // Use Firebase UID as the user ID
                    ...usersData[uid]
                });
            }
        }
        // Call the callback with the new list of users
        callback(userList);
    }, (error) => {
        if (errorCallback) {
            errorCallback(error);
        }
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
    
    // Use individual set() calls instead of update() at root to avoid permission issues
    // 1. Set the protected /users node
    const userRef = ref(database, `users/${newUserId}`);
    await set(userRef, newUser);
    
    // 2. Set the public /login_credentials node
    const credentialsRef = ref(database, `login_credentials/${newUserId}`);
    await set(credentialsRef, {
        username: newUser.username,
        hashed_password: hashedPassword,
        isActive: newUser.isActive,
        role: newUser.role 
    });
    
    return newUserId;
}

/**
 * Updates an existing user record in the RTDB and the public login_credentials node.
 */
async function updateUser(uid, userData) {
    const { rawPassword, ...rest } = userData;
    
    // Filter out undefined values to prevent Firebase errors
    const cleanedData = {};
    Object.keys(rest).forEach(key => {
        if (rest[key] !== undefined) {
            cleanedData[key] = rest[key];
        }
    });
    
    const updates = {
        ...cleanedData,
        username: sanitizeInput(userData.username),
    };

    if (rawPassword) {
        updates.hashed_password = await hashPassword(rawPassword); 
    }

    // Use individual set/update calls instead of update() at root to avoid permission issues
    // 1. Update the protected /users node
    const userRef = ref(database, `users/${uid}`);
    await update(userRef, updates);

    // 2. Update the public /login_credentials node (only update fields that exist there)
    const credentialsRef = ref(database, `login_credentials/${uid}`);
    const credentialUpdates = {};
    
    if (updates.hashed_password) {
        credentialUpdates.hashed_password = updates.hashed_password;
    }
    if (updates.username) {
        credentialUpdates.username = updates.username;
    }
    if (updates.isActive !== undefined) {
        credentialUpdates.isActive = updates.isActive;
    }
    if (updates.role) {
        credentialUpdates.role = updates.role;
    }
    
    if (Object.keys(credentialUpdates).length > 0) {
        await update(credentialsRef, credentialUpdates);
    }
}

/**
 * Deletes a user record from the RTDB and the public login_credentials node.
 */
async function deleteUser(uid) {
    // Use individual remove() calls instead of update() at root to avoid permission issues
    const userRef = ref(database, `users/${uid}`);
    const credentialsRef = ref(database, `login_credentials/${uid}`);
    
    await Promise.all([
        remove(userRef),
        remove(credentialsRef)
    ]);
}

// Toggling active status
async function toggleUserStatus(uid, isActive) {
    // Use individual update() calls instead of update() at root to avoid permission issues
    const userRef = ref(database, `users/${uid}`);
    const credentialsRef = ref(database, `login_credentials/${uid}`);
    
    await Promise.all([
        update(userRef, { isActive: isActive }),
        update(credentialsRef, { isActive: isActive })
    ]);
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
