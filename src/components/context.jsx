import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


const Context = createContext()

export function ContextProvider({children}){
    // FIX: Initialize state SYNCHRONOUSLY from localStorage to prevent redirection race condition
    const [role, setRole] = useState(() => localStorage.getItem('encg_user_role') || null)
    const navigate = useNavigate()

    // REMOVED: The previous useEffect block is now redundant because useState handles initialization.

    // FIX: Modify handleLogin to return true/false on success/failure
    function handleLogin(username, password){
        // Load users from localStorage
        const savedUsers = localStorage.getItem('encg_users');
        let users = [];
        
        if (savedUsers) {
            users = JSON.parse(savedUsers);
        } else {
            // Default users if none exist
            users = [
                {
                    id: 1,
                    username: "admin",
                    password: "123",
                    role: "admin",
                    fullName: "Admin User",
                    email: "admin@encg.ma",
                    year: "all",
                    createdAt: new Date().toISOString(),
                    isActive: true
                },
                {
                    id: 2,
                    username: "1ere",
                    password: "123",
                    role: "student",
                    fullName: "Student 1ere",
                    email: "student1@encg.ma",
                    year: "1ere",
                    createdAt: new Date().toISOString(),
                    isActive: true
                },
                {
                    id: 3,
                    username: "2eme",
                    password: "123",
                    role: "student",
                    fullName: "Student 2eme",
                    email: "student2@encg.ma",
                    year: "2eme",
                    createdAt: new Date().toISOString(),
                    isActive: true
                },
                {
                    id: 4,
                    username: "3eme",
                    password: "123",
                    role: "student",
                    fullName: "Student 3eme",
                    email: "student3@encg.ma",
                    year: "3eme",
                    createdAt: new Date().toISOString(),
                    isActive: true
                },
                {
                    id: 5,
                    username: "4eme",
                    password: "123",
                    role: "student",
                    fullName: "Student 4eme",
                    email: "student4@encg.ma",
                    year: "4eme",
                    createdAt: new Date().toISOString(),
                    isActive: true
                },
                {
                    id: 6,
                    username: "5eme",
                    password: "123",
                    role: "student",
                    fullName: "Student 5eme",
                    email: "student5@encg.ma",
                    year: "5eme",
                    createdAt: new Date().toISOString(),
                    isActive: true
                }
            ];
            localStorage.setItem('encg_users', JSON.stringify(users));
        }

        // Find user with matching credentials
        const user = users.find(u => u.username === username && u.password === password && u.isActive);
        
        if (user) {
            setRole(user.role);
            
            // Save to localStorage
            localStorage.setItem('encg_user_role', user.role);
            localStorage.setItem('encg_current_user', JSON.stringify({
                id: user.id,
                username: user.username,
                role: user.role,
                year: user.year
            }));
            
            // Navigate on success
            if (user.role === 'admin') {
                navigate('/dashboard');
            } else {
                navigate('/');
            }
            return true; // <-- Signal success
        } else {
            // Removed alert() and return false on failure
            return false; // <-- Signal failure
        }
    }

    function logout(){
        setRole(null)
        // Clear localStorage
        localStorage.removeItem('encg_user_role');
        localStorage.removeItem('encg_current_user');
        navigate('/login')
    }


    return(
        <Context.Provider value={{role, handleLogin, logout}}>
            {children}
        </Context.Provider>
    )


}

export { Context };