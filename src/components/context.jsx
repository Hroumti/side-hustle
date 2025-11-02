import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../utils/auth.js";

export const Context = createContext();

export function ContextProvider({children}){
    const [role, setRole] = useState(() => localStorage.getItem('encg_user_role') || null);
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [authState, setAuthState] = useState(0); // Force re-render trigger
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
            console.log('Auth state changed:', { firebaseUser: !!firebaseUser, userRole });
            setRole(userRole);
            if (firebaseUser && userRole) {
                const userData = JSON.parse(localStorage.getItem('encg_current_user') || '{}');
                setCurrentUser({
                    ...userData,
                    firebaseUid: firebaseUser.uid,
                    role: userRole,
                    lastActivity: Date.now()
                });
                
                // Update last activity timestamp
                localStorage.setItem('encg_last_activity', Date.now().toString());
            } else {
                setCurrentUser(null);
            }
            // Force re-render
            setAuthState(prev => prev + 1);
        });

        // Session timeout check
        const sessionCheckInterval = setInterval(async () => {
            if (role) {
                const { isSessionExpired, needsSessionRefresh } = await import('../utils/securityConfig.js');
                const loginTime = parseInt(localStorage.getItem('encg_login_time') || '0');
                const lastActivity = parseInt(localStorage.getItem('encg_last_activity') || '0');
                
                if (isSessionExpired(loginTime)) {
                    console.log('Session expired, logging out');
                    await logout();
                } else if (needsSessionRefresh(lastActivity)) {
                    // Update activity timestamp
                    localStorage.setItem('encg_last_activity', Date.now().toString());
                }
            }
        }, 60000); // Check every minute

        return () => {
            unsubscribe();
            clearInterval(sessionCheckInterval);
        };
    }, []);

    // Handle login using the new auth service
    async function handleLogin(username, rawPassword){
        try {
            const result = await authService.loginWithCredentials(username, rawPassword);
            
            if (result.success) {
                console.log('Login successful, updating state:', result.user.role);
                
                // Immediately update local state
                const newRole = result.user.role;
                const loginTime = Date.now();
                const newUser = {
                    uid: result.user.uid,
                    username: username,
                    role: newRole,
                    isActive: result.user.isActive,
                    firebaseUid: result.firebaseUser.uid,
                    loginTime: loginTime,
                    lastActivity: loginTime
                };
                
                // Store login time for session management
                localStorage.setItem('encg_login_time', loginTime.toString());
                localStorage.setItem('encg_last_activity', loginTime.toString());
                
                setRole(newRole);
                setCurrentUser(newUser);
                setAuthState(prev => prev + 1); // Force re-render
                
                // Navigate after ensuring state is updated
                setTimeout(() => {
                    console.log('Navigating to:', newRole === 'admin' ? '/dashboard' : '/');
                    if (newRole === 'admin') {
                        navigate('/dashboard');
                    } else {
                        navigate('/');
                    }
                }, 50); // Reduced delay
                
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
            isAuthenticated: !!role,
            isAdmin: role === 'admin'
        }}>
            {children}
        </Context.Provider>
    )
}
