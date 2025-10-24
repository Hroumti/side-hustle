import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";


const Context = createContext()

export function ContextProvider({children}){
    const [role, setRole] = useState(null)
    const navigate = useNavigate()
    function handleLogin(role){
        if(role==='admin'){
            setRole('admin')
            navigate('/dashboard')
        } else if(role==='3eme'||role==='4eme'||role==='5eme'){
            setRole('student')
            navigate('/home')
        } else{
            alert('Invalid')
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