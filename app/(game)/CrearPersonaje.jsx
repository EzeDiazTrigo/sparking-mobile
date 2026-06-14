import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, View, SafeAreaView, ScrollView, Image } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useAuth } from '../../src/context/AuthContext'
import { SPRITES } from '../../src/constants/sprites'

const RAZAS = ['Saiyajin', 'Namek', 'Humano', 'Androide', 'Freezer']
const GENEROS = ['M', 'F']

function generarMaxKi() {
    const min = 100_000
    const max = 100_000_000
    return Math.floor(Math.random() * (max - min + 1)) + min
}

export default function CrearPersonaje() {

    const { user } = useAuth()
    const router = useRouter()
    const { id } = useLocalSearchParams()
    const esEdicion = !!id

    const [nombre, setNombre] = useState('')
    const [ki, setKi] = useState('')
    const [raza, setRaza] = useState(null)
    const [genero, setGenero] = useState(null)
    const [fotoId, setFotoId] = useState(null)
    const [maxKiOriginal, setMaxKiOriginal] = useState(null)
    const [error, setError] = useState(null)
    const [creando, setCreando] = useState(false)

    useEffect(() => {
        if (!esEdicion) return

        const cargarPersonaje = async () => {
            const url = `https://6a2b50c3b687a7d5cbc51cc1.mockapi.io/sp/character/${id}`
            const response = await fetch(url)
            const data = await response.json()

            setNombre(data.name)
            setKi(String(data.ki))
            setRaza(data.race)
            setGenero(data.gender)
            setFotoId(data.image)
            setMaxKiOriginal(data.maxKi)
        }
        cargarPersonaje()
    }, [id])

    const onGuardar = async () => {

        if (!nombre || !ki || !raza || !genero || !fotoId) {
            setError('Faltan datos')
            return
        }

        setCreando(true)
        setError(null)

        const body = {
            userId: user.id,
            name: nombre,
            ki: Number(ki),
            maxKi: esEdicion ? maxKiOriginal : generarMaxKi(),
            race: raza,
            gender: genero,
            image: fotoId,
        }

        const url = esEdicion
            ? `https://6a2b50c3b687a7d5cbc51cc1.mockapi.io/sp/character/${id}`
            : 'https://6a2b50c3b687a7d5cbc51cc1.mockapi.io/sp/character'

        try {
            const response = await fetch(url, {
                method: esEdicion ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })

            if (!response.ok) {
                setError('No se pudo crear el personaje')
                return
            }

            router.back()

        } catch (e) {
            setError('Error de red')
        } finally {
            setCreando(false)
        }
    }

    return (
        <View style={styles.container}>
            <StatusBar hidden />

            <SafeAreaView style={styles.safeArea}>
                <ScrollView showsVerticalScrollIndicator={false}>

                    <Text style={styles.title}>{esEdicion ? 'Editar Personaje' : 'Crear Personaje'}</Text>

                    <Text style={styles.label}>Nombre</Text>
                    <TextInput
                        style={styles.input}
                        value={nombre}
                        onChangeText={setNombre}
                        placeholder="Goku"
                        placeholderTextColor="#7d8ca3"
                    />

                    <Text style={styles.label}>Ki inicial</Text>
                    <TextInput
                        style={styles.input}
                        value={ki}
                        onChangeText={setKi}
                        placeholder="1000"
                        placeholderTextColor="#7d8ca3"
                        keyboardType="numeric"
                    />

                    <Text style={styles.label}>Raza</Text>
                    <View style={styles.optionsRow}>
                        {RAZAS.map((r) => (
                            <TouchableOpacity
                                key={r}
                                style={[styles.optionButton, raza === r && styles.optionButtonSelected]}
                                onPress={() => setRaza(r)}
                            >
                                <Text style={[styles.optionText, raza === r && styles.optionTextSelected]}>
                                    {r}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.label}>Género</Text>
                    <View style={styles.optionsRow}>
                        {GENEROS.map((g) => (
                            <TouchableOpacity
                                key={g}
                                style={[styles.optionButton, genero === g && styles.optionButtonSelected]}
                                onPress={() => setGenero(g)}
                            >
                                <Text style={[styles.optionText, genero === g && styles.optionTextSelected]}>
                                    {g}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.label}>Imagen</Text>
                    <View style={styles.imageGrid}>
                        {Object.keys(SPRITES).map((id) => (
                            <TouchableOpacity
                                key={id}
                                style={[styles.imageOption, fotoId === id && styles.imageOptionSelected]}
                                onPress={() => setFotoId(id)}
                            >
                                <Image source={SPRITES[id]} style={styles.imagePreview} />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {error && <Text style={styles.error}>{error}</Text>}

                    <TouchableOpacity
                        style={[styles.submitButton, creando && styles.submitButtonDisabled]}
                        onPress={onGuardar}
                        disabled={creando}
                    >
                        <Text style={styles.submitText}>
                            {creando ? 'Creando...' : 'Guardar'}
                        </Text>
                    </TouchableOpacity>

                </ScrollView>
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
        marginBottom: 30,
        letterSpacing: 2,
    },

    label: {
        color: '#fff',
        fontSize: 14,
        marginTop: 18,
        marginBottom: 8,
        letterSpacing: 1,
    },

    input: {
        backgroundColor: '#02142b',
        color: '#fff',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#1a2942',
    },

    optionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },

    optionButton: {
        backgroundColor: '#02142b',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#1a2942',
    },

    optionButtonSelected: {
        backgroundColor: '#2db4ff',
        borderColor: '#2db4ff',
    },

    optionText: {
        color: '#7d8ca3',
        fontSize: 14,
        fontWeight: '600',
    },

    optionTextSelected: {
        color: '#0a0e1a',
    },

    error: {
        color: '#ff5b5b',
        marginTop: 16,
        fontSize: 14,
    },

    submitButton: {
        backgroundColor: '#afe2ff',
        borderRadius: 24,
        padding: 18,
        marginTop: 30,
        marginBottom: 30,
        alignItems: 'center',
    },

    submitButtonDisabled: {
        opacity: 0.5,
    },

    submitText: {
        color: '#0a0e1a',
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 1,
    },

    imageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },

    imageOption: {
        width: '48%',
        aspectRatio: 1,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#1a2942',
        overflow: 'hidden',
        backgroundColor: '#02142b',
        marginBottom: 8,
    },

    imageOptionSelected: {
        borderColor: '#2db4ff',
    },

    imagePreview: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
})
