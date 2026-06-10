import { useRouter } from "expo-router";
import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage"


export const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)
export function AuthProvider({ children }) {
    
    const [user, setUser] = useState(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true);

    
    const router = useRouter()

    useEffect(() => {

        console.log("Cargando layout");
        
        const cargarSesion = async () => {

            const storage = await AsyncStorage.getItem("user")
            if(storage){
                setUser(JSON.parse(storage))
            }
            setLoading(false)
        }
        cargarSesion()
    }, [])


    const login = async (email, password) => {

        if (!email || !password) {
            console.log("Faltan Datos")
            setError("Faltan Datos")
            return
        }

        const response = await fetch("https://6a2898d24e1e783349a5aeca.mockapi.io/sp/users");
        const data = await response.json()

        console.log("data: ", data);
        

        const busqueda = data.find((usuario) => {
            return usuario.email === email && usuario.password === password
        })

        if (!busqueda) {
            console.log("usuario o password incorrecto");

            setError("Usuario o password incorrectos")
            return
        }


        try {
           await AsyncStorage.setItem("user", JSON.stringify(busqueda))
        } catch (error) {
            console.log("error: ", error);
            
        }
        setUser(busqueda)
        
        setError('')

        router.replace("/(tabs)/Home")

    }

    const register = async (email, password, userName, profilePic) => {

        if (!email || !password || !userName || !profilePic) {
            console.log("Faltan Datos")
            setError("Faltan Datos")
            return
        }

        const body = {
            email: email,
            password: password,
            username: userName,
            profile_pic: profilePic
        }

        console.log("BODY: ", body);
        
        const response = await fetch("https://6a2898d24e1e783349a5aeca.mockapi.io/sp/users", {
            method: "POST",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify(body)
        });

        const data = await response.json()

        console.log("data: ", data);
        

        try {
           await AsyncStorage.setItem("user", JSON.stringify(data))
        } catch (error) {
            console.log("error: ", error);
        }
        setUser(data)
        setError('')

        router.replace("/(tabs)/Home")
    }

    const logout = () => {
        setUser(null)
        AsyncStorage.removeItem("user")
        router.replace("/(auth)/Login")
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, error }}>
            {children}
        </AuthContext.Provider>
    )
}