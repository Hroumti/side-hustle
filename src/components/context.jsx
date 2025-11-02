import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../utils/auth.js";

export const Context = createContext();

export function ContextProvider({children}){
    const [role, setRole] = useState(() => localStorage.getItem('encg_user_role') || null);
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Initialize auth service and listen to auth state changes
    useEffect(() => {
        const initAuth = async () => {
            await authService.initialize();
            setIsLoading(false);
        };

        initAuth();

        // Listen to auth state changes
        const unsubscribe = authService.onAuthStateChange((firebaseUser, userRole) => {
            setRole(userRole);
            if (firebaseUser && userRole) {
                const userData = JSON.parse(localStorage.getItem('encg_current_user') || '{}');
                setCurrentUser({
                    ...userData,
                    firebaseUid: firebaseUser.uid,
                    role: userRole
                });
            } else {
                setCurrentUser(null);
            }
        });

        return unsubscribe;
    }, []);

    // Handle login using the new auth service
    async function handleLogin(username, rawPassword){
        try {
            const result = await authService.loginWithCredentials(username, rawPassword);
            
            if (result.success) {
                // Navigation will be handled by auth state change listener
                if (result.user.role === 'admin') {
                    navigate('/dashboard');
                } else {
                    navigate('/');
                }
                return true;
            } else {
                console.error('Login failed:', result.error);
                return false;
            }
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    }

    async function logout(){
        try {
            await authService.logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            // Force navigation even if logout fails
            navigate('/login');
        }
    }

    return(
        <Context.Provider value={{
            role, 
            handleLogin, 
            logout, 
            currentUser,
            isLoading,
            isAuthenticated: authService.isAuthenticated(),
            isAdmin: authService.isAdmin()
        }}>
            {children}
        </Context.Provider>
    )
}
