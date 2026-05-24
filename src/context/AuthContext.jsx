import { useRouter } from "expo-router";
import { createContext, useContext, useState } from "react";

export const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)
export function AuthProvider({ children }) {
    
    const [user, setUser] = useState(null)
    const [error, setError] = useState(null)
    
    const MOCK_USER = [
    {
        id: 1,
        name: 'Eze',
        email: 'eze@ort.com',
        password: 'Eze'
    },
    {
        id: 2,
        name: 'Rodri',
        email: 'rodri@ort.com',
        password: 'Rodri'
    }
    ]
    
    const router = useRouter()


    const login = (email, password) => {


        if (!email || !password) {
            console.log("Faltan Datos")
            setError("Faltan Datos")
            return
        }

        const busqueda = MOCK_USER.find((usuario) => {
            return usuario.email === email && usuario.password === password
        })

        if (!busqueda) {
            console.log("usuario o password incorrecto");

            setError("Usuario o password incorrectos")
            return
        }

        setUser(busqueda)
        setError('')

        router.replace("/(tabs)/Home")

    }



    const logout = () => {
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, error }}>
            {children}
        </AuthContext.Provider>
    )
}