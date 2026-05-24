import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments, useNavigationContainerRef } from 'expo-router';
import { AuthProvider, useAuth } from '../src/context/AuthContext';

function RootLayoutNav(){

    const { user } = useAuth()
    const router = useRouter()
    const segments = useSegments()
    const navigationRef = useNavigationContainerRef()
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        if (navigationRef?.isReady()) {
            setIsReady(true)
        }
    }, [navigationRef?.isReady()])

    console.log("SEGMENTO: ", segments);

    useEffect(() => {
        if (!isReady) return

        const estaEnAuth = segments[0] === "(auth)"

        if(!user && !estaEnAuth){
            router.replace('/(tabs)/login')

        }else if(user && estaEnAuth){
            router.replace("/(tabs)/home")
        }

    }, [user, segments, isReady])
    
    

  return (
    <Stack screenOptions={{ headerShown: false}}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
    </Stack>
  )
}

export default function RootLayout(){
    return (
        <AuthProvider>
            <RootLayoutNav/>
        </AuthProvider>
    )
}