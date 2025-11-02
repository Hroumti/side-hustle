import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dbUtils } from "../utils/db-utils.js";
import { auth } from "../firebase.js"; // Import Firebase Auth for the sign-in step
import { signInWithCustomToken } from 'firebase/auth';

export const Context = createContext();

export function ContextProvider({children}){
    // Use Firebase Auth's currentUser status if available, otherwise rely on session/local storage for role
    const [role, setRole] = useState(() => localStorage.getItem('encg_user_role') || null);
    const [currentUser, setCurrentUser] = useState(null); // To store {uid, role, year, etc.}
    const navigate = useNavigate();

    // The core logic that handles credential checking and user data retrieval
    async function handleLogin(username, rawPassword){
        // 1. Find user credential in the publicly readable RTDB path
        const userCredential = await dbUtils.findUserForLogin(username, rawPassword);
        
        if (userCredential) {
            // Check for inactive status (though logic is also in findUserForLogin)
            if (!userCredential.isActive) {
                return false; // Inactive user
            }
            
            // 2. SUCCESS: Generate a custom token using a server (which is not available here)
            //    Since we can't generate a token, we skip to setting the context role
            //    and relying on that role for client-side authentication.
            
            // For now, we will assume successful login means we can set the role
            // and navigate, even though Firebase Auth itself remains unauthenticated.

            setRole(userCredential.role);
            setCurrentUser(userCredential);
            
            // Persist the role and minimal user info
            localStorage.setItem('encg_user_role', userCredential.role);
            localStorage.setItem('encg_current_user', JSON.stringify({
                uid: userCredential.uid,
                username: username, // Note: using raw username here
                role: userCredential.role,
                isActive: userCredential.isActive
            }));
            
            if (userCredential.role === 'admin') {
                navigate('/dashboard');
            } else {
                navigate('/');
            }
            return true;
        } else {
            // FAILED: Incorrect identification (username or password)
            return false;
        }
    }

    function logout(){
        setRole(null);
        setCurrentUser(null);
        // Clear all persisted data
        localStorage.removeItem('encg_user_role');
        localStorage.removeItem('encg_current_user');
        
        // This is a placeholder since we don't have server-side Firebase Auth sign-out.
        // If a Firebase Auth user was signed in, we'd call signOut(auth).
        
        navigate('/login');
    }

    return(
        // Expose currentUser for use in ProtectedRoute or other components
        <Context.Provider value={{role, handleLogin, logout, currentUser}}>
            {children}
        </Context.Provider>
    )
}
