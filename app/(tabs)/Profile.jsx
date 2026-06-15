import React, { useState } from 'react'
import {
    View,
    Text,
    TextInput,
    Image,
    StyleSheet
} from 'react-native'
import { useAuth } from '../../src/context/AuthContext'
import { TouchableOpacity } from 'react-native'
import TopBar from '../../src/components/TopBar'



export default function Profile() {

const { user, logout, editUser, error } = useAuth()

    const [editando, setEditando] = useState(false)
    const [userName, setUserName] = useState(user?.username || '')
    const [profilePic, setProfilePic] = useState(user?.profile_pic || '')
    const [password, setPassword] = useState('')

    const guardarCambios = async () => {
        const ok = await editUser(userName, profilePic, password)

        if (ok) {
            setEditando(false)
        }
    }

    return (
        <View style={styles.container}>

            <Image
                source={{ uri: user?.profile_pic }}
                style={styles.avatar}
            />

            <Text style={styles.username}>
                {user?.username}
            </Text>

            {editando && (
                <>
                    <TextInput
                        style={styles.input}
                        value={userName}
                        onChangeText={setUserName}
                        placeholder="Nombre de usuario"
                    />

                    <TextInput
                        style={styles.input}
                        value={profilePic}
                        onChangeText={setProfilePic}
                        placeholder="URL de la foto"
                    />

                    <TextInput
                      style={styles.input}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Contraseña"
                      secureTextEntry
                    />

                    <TouchableOpacity
                        style={styles.button}
                        onPress={guardarCambios}
                    >
                        <Text style={styles.buttonText}>
                            GUARDAR CAMBIOS
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => {
                            setEditando(false)
                            setUserName(user?.username || '')
                            setProfilePic(user?.profile_pic || '')
                        }}
                    >
                        <Text style={styles.buttonText}>
                            CANCELAR
                        </Text>
                    </TouchableOpacity>
                </>
            )}

            {!editando && (
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => setEditando(true)}
                >
                    <Text style={styles.buttonText}>
                        EDITAR PERFIL
                    </Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity
                style={styles.button}
                onPress={logout}
            >
                <Text style={styles.buttonText}>
                    CERRAR SESIÓN
                </Text>
            </TouchableOpacity>

            {!!error && (
                <Text style={styles.error}>
                    {error}
                </Text>
            )}

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#0a0e1a',
    },

    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 16,
    },

    username: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        color: '#fff',
    },

    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        color: '#fff',
    },

    button: {
        width: '100%',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 12,
        backgroundColor: '#2db4ff',
    },

    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },

    error: {
        color: 'red',
        marginTop: 12,
    },
  })