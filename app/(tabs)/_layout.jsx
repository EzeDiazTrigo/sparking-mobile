import { Tabs } from 'expo-router'
import React from 'react'
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';

export default function TabsLayout(){


  return (
        <Tabs
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          backgroundColor: '#02142b',
          borderTopWidth: 0,
          height: 70,
        },

        tabBarActiveTintColor: '#2db4ff',
        tabBarInactiveTintColor: '#7d8ca3',
      }}
    >

      <Tabs.Screen
        name="Home"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <AntDesign
              name="home"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="TusPersonajes"
        options={{
          title: 'Tus personajes',
          tabBarIcon: ({ color, size }) => (
            <Feather
              name="users"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="Profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Feather
              name="user"
              size={size}
              color={color}
            />
          ),
        }}
      />

    </Tabs>
  )
}
