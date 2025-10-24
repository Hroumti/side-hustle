import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";


const Context = createContext()

export function ContextProvider({children}){
    const [role, setRole] = useState(null)
    const navigate = useNavigate()
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
            if (user.role === 'admin') {
                navigate('/dashboard');
            } else {
                navigate('/');
            }
        } else {
            alert('Invalid username or password');
        }
    }

    function logout(){
        setRole(null)
        navigate('/login')
    }


    return(
        <Context.Provider value={{role, handleLogin, logout}}>
            {children}
        </Context.Provider>
    )


}

export default Context