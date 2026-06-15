import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet, SafeAreaView, Alert } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useAuth } from '../../src/context/AuthContext'
import { useRouter, useFocusEffect } from 'expo-router'
import { SPRITES } from '../../src/constants/sprites'

const AVATAR_PLACEHOLDER = 'https://static.vecteezy.com/system/resources/thumbnails/053/406/424/small/person-gray-photo-placeholder-man-on-gray-background-avatar-man-icon-anonymous-user-male-no-photo-web-template-default-user-picture-for-social-networks-social-media-resume-forums-free-vector.jpg'

export default function TusPersonajes() {
    const [personajes, setPersonajes] = useState([])
    const [cargando, setCargando] = useState(true)
    const { user } = useAuth()
    const router = useRouter()

    const traerPersonajes = async () => {
        setCargando(true)
        const url = `https://6a2b50c3b687a7d5cbc51cc1.mockapi.io/sp/character?userId=${user.id}`
        const response = await fetch(url)
        const data = await response.json()
        setPersonajes(Array.isArray(data) ? data : [])
        setCargando(false)
    }

    useFocusEffect(
        useCallback(() => {
            traerPersonajes();
        }, [])
    );

    const borrarPersonaje = (id) => {
        Alert.alert(
            'Borrar personaje',
            '¿Estás seguro? Esta acción no se puede deshacer.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Borrar',
                    style: 'destructive',
                    onPress: async () => {
                        const url = `https://6a2b50c3b687a7d5cbc51cc1.mockapi.io/sp/character/${id}`
                        await fetch(url, { method: 'DELETE' })
                        traerPersonajes()
                    }
                }
            ]
        )
    }

    return (
        <View style={styles.container}>
            <StatusBar hidden />

            <SafeAreaView style={styles.safeArea}>

                <Text style={styles.title}>Tus Personajes</Text>

                {cargando && personajes.length === 0 && (
                    <Text style={styles.message}>Cargando...</Text>
                )}

                {!cargando && personajes.length === 0 && (
                    <Text style={styles.message}>Todavia no tenes personajes</Text>
                )}

                {personajes.length > 0 && (
                    <FlatList
                        data={personajes}
                        keyExtractor={(item, index) => String(item.id ?? index)}
                        refreshing={cargando}
                        onRefresh={traerPersonajes}
                        renderItem={({ item }) => (
                            <View style={styles.card}>
                                <Image
                                    source={SPRITES[item.image] || { uri: AVATAR_PLACEHOLDER }}
                                    style={styles.avatar}
                                />
                                <View style={styles.cardBody}>
                                    <Text style={styles.cardName}>{item.name}</Text>
                                    <Text style={styles.cardInfo}>Ki: {item.ki} / {item.maxKi}</Text>
                                    <Text style={styles.cardInfo}>{item.race} - {item.gender}</Text>
                                </View>
                                <View style={styles.cardActions}>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => router.push({ pathname: '/CrearPersonaje', params: { id: item.id } })}
                                    >
                                        <MaterialCommunityIcons name="pencil-outline" size={22} color="#2db4ff" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => borrarPersonaje(item.id)}
                                    >
                                        <MaterialCommunityIcons name="delete-outline" size={22} color="#ff5b5b" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    />
                )}

                <TouchableOpacity
                    style={styles.createButton}
                    activeOpacity={0.85}
                    onPress={() => router.push('/CrearPersonaje')}
                >
                    <Text style={styles.createButtonText}>Crear Personaje</Text>
                </TouchableOpacity>

            </SafeAreaView>
        </View>
    )
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#0a0e1a',
    },

    safeArea: {
        flex: 1,
        paddingHorizontal: 20,
    },

    title: {
        color: '#fff',
        fontSize: 32,
        fontWeight: '900',
        marginTop: 30,
        marginBottom: 20,
        letterSpacing: 2,
    },

    message: {
        color: '#7d8ca3',
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
    },

    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#02142b',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#1a2942',
    },

    avatar: {
        width: 60,
        height: 60,
        borderRadius: 12,
        marginRight: 14,
    },

    cardBody: {
        flex: 1,
        justifyContent: 'center',
    },

    cardName: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
    },

    cardInfo: {
        color: '#7d8ca3',
        fontSize: 13,
        marginTop: 2,
    },

    createButton: {
        backgroundColor: '#afe2ff',
        borderRadius: 24,
        padding: 18,
        marginVertical: 20,
        alignItems: 'center',
    },

    createButtonText: {
        color: '#0a0e1a',
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 1,
    },

    cardActions: {
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingLeft: 8,
    },

    actionButton: {
        padding: 6,
    },
})
