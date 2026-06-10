import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments, useNavigationContainerRef } from 'expo-router';
import { AuthProvider, useAuth } from '../src/context/AuthContext';

function RootLayoutNav(){

    const { user, loading } = useAuth()
    const router = useRouter()
    const segments = useSegments()

    console.log("SEGMENTO: ", segments);

    useEffect(() => {

        if(loading) return

        const estaEnAuth = segments[0] === "(auth)"

        if(!user && !estaEnAuth){
            router.replace('/(auth)/Login')

        }else if(user && estaEnAuth){
            router.replace("/(tabs)/Home")
        }

    }, [user, segments])
    
    

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