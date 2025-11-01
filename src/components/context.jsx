import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const Context = createContext()

export function ContextProvider({children}){
    const [role, setRole] = useState(() => localStorage.getItem('encg_user_role') || null)
    const navigate = useNavigate()

    function handleLogin(username, password){
        const savedUsers = localStorage.getItem('encg_users');
        let users = [];
        
        if (savedUsers) {
            users = JSON.parse(savedUsers);
        } else {
            users = [
                {
                    id: 1,
                    username: "Admin",
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

        const user = users.find(u => u.username === username && u.password === password && u.isActive);
        
        if (user) {
            setRole(user.role);
            
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
            return true;
        } else {
            return false;
        }
    }

    function logout(){
        setRole(null)
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