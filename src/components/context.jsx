import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


const Context = createContext()

export function ContextProvider({children}){
    const [role, setRole] = useState(null)
    const navigate = useNavigate()

    // Check localStorage on component mount
    useEffect(() => {
        const savedRole = localStorage.getItem('encg_user_role');
        const savedUser = localStorage.getItem('encg_current_user');
        
        if (savedRole && savedUser) {
            setRole(savedRole);
            // Redirect based on role
            if (savedRole === 'admin') {
                navigate('/dashboard');
            } else {
                navigate('/');
            }
        }
    }, [navigate]);
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
                    username: "3eme",
                    password: "123",
                    role: "admin",
                    fullName: "Admin User",
                    email: "admin@encg.ma",
                    year: "3eme",
                    createdAt: new Date().toISOString(),
                    isActive: true
                },
                {
                    id: 2,
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
                    id: 3,
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
            
            if (user.role === 'admin') {
                navigate('/dashboard');
            } else {
                navigate('/');
            }
        } else {
            alert('Nom d\'utilisateur ou mot de passe incorrect.');
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