import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useAuth } from '../../src/context/AuthContext'
import { TouchableOpacity } from 'react-native'
import TopBar from '../../src/components/TopBar'



export default function Profile() {

    const { logout, error } = useAuth()
    
  return (
    <View style={styles.container}>
        <View style={styles.profileSection}>
            <TopBar/>
        </View>
      <TouchableOpacity style={styles.button} onPress={() => logout()}>
        <Text style={styles.buttonText}>CERRAR SESION</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#f5c518',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    width: '85%',
    marginTop: 8,
  },

    profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
})
