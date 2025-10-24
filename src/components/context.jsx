import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";


const Context = createContext()

export function ContextProvider({children}){
    const [role, setRole] = useState(null)
    const navigate = useNavigate()
    function handleLogin(role){
        if(role==='admin'){
            setRole('admin')
            navigate('/home/admin')
        } else if(role==='3eme'){
            setRole('3eme')
            navigate('/home/3eme')
        } else if(role==='4eme'){
            setRole('4eme')
            navigate('/home/4eme')
        }else if(role==='5eme'){
            setRole('5eme')
            navigate('/home/5eme')
        } else{
            navigate('/login')
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