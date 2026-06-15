import React, { useEffect, useState } from 'react'
import {
    View,
    Text,
    Image,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    FlatList,
    ScrollView,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { useAuth } from '../context/AuthContext'
import { SPRITES } from '../constants/sprites'

const TEAM_URL = 'https://6a2898d24e1e783349a5aeca.mockapi.io/sp'
const DUEL_URL = 'https://6a2b50c3b687a7d5cbc51cc1.mockapi.io/sp/duel'

const difficulties = [
    { id: 1, label: 'Fácil' },
    { id: 2, label: 'Media' },
    { id: 3, label: 'Difícil' },
]

const getDifficultyLabel = (id) => {
    return difficulties.find(d => d.id === id)?.label ?? 'Desconocida'
}

export default function ConfiguracionBatalla({ onStart }) {
    const { user } = useAuth()
    const [teams, setTeams] = useState([])
    const [duels, setDuels] = useState([])
    const [selectedTeamId, setSelectedTeamId] = useState(null)
    const [selectedDuelId, setSelectedDuelId] = useState(null)
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        if (!user?.id) return

        const cargar = async () => {
            try {
                setCargando(true)
                const [teamsRes, duelsRes] = await Promise.all([
                    fetch(`${TEAM_URL}/users/${user.id}/team`),
                    fetch(`${DUEL_URL}?userId=${user.id}`),
                ])
                const teamsData = await teamsRes.json()
                const duelsData = await duelsRes.json()
                setTeams(Array.isArray(teamsData) ? teamsData : [])
                setDuels(Array.isArray(duelsData) ? duelsData : [])
            } catch (error) {
                console.log('Error al cargar config:', error)
                setTeams([])
                setDuels([])
            } finally {
                setCargando(false)
            }
        }
        cargar()
    }, [user])

    const empezar = () => {
        const equipo = teams.find(t => String(t.id) === String(selectedTeamId))
        const duelo = duels.find(d => String(d.id) === String(selectedDuelId))
        if (!equipo || !duelo) return
        onStart({ equipo, duelo })
    }

    const puedeEmpezar = selectedTeamId !== null && selectedDuelId !== null

    return (
        <View style={styles.container}>
            <StatusBar hidden />

            <SafeAreaView style={styles.safeArea}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

                    <Text style={styles.title}>Configurar Batalla</Text>
                    <Text style={styles.subtitle}>Elegí tu equipo y el duelo.</Text>

                    <Text style={styles.label}>Equipo</Text>

                    {cargando && <Text style={styles.message}>Cargando...</Text>}

                    {!cargando && teams.length === 0 && (
                        <Text style={styles.message}>No tenés equipos. Creá uno primero.</Text>
                    )}

                    {!cargando && teams.length > 0 && (
                        <FlatList
                            data={teams}
                            horizontal
                            keyExtractor={(item) => String(item.id)}
                            showsHorizontalScrollIndicator={false}
                            renderItem={({ item: equipo }) => {
                                const seleccionado = String(equipo.id) === String(selectedTeamId)
                                return (
                                    <TouchableOpacity
                                        style={[styles.card, seleccionado && styles.cardSelected]}
                                        onPress={() => setSelectedTeamId(equipo.id)}
                                    >
                                        <Text style={styles.cardTitle}>{equipo.name}</Text>
                                        <View style={styles.avatarRow}>
                                            {Array.isArray(equipo.characters) && equipo.characters.slice(0, 5).map((c) => (
                                                <View key={c.id} style={styles.avatarFrame}>
                                                    <Image
                                                        source={SPRITES[c.image] || { uri: '' }}
                                                        style={styles.avatar}
                                                    />
                                                </View>
                                            ))}
                                        </View>
                                    </TouchableOpacity>
                                )
                            }}
                        />
                    )}

                    <Text style={styles.label}>Duelo</Text>

                    {!cargando && duels.length === 0 && (
                        <Text style={styles.message}>No tenés duelos. Creá uno primero.</Text>
                    )}

                    {!cargando && duels.length > 0 && (
                        <FlatList
                            data={duels}
                            horizontal
                            keyExtractor={(item) => String(item.id)}
                            showsHorizontalScrollIndicator={false}
                            renderItem={({ item: duelo }) => {
                                const seleccionado = String(duelo.id) === String(selectedDuelId)
                                return (
                                    <TouchableOpacity
                                        style={[styles.card, seleccionado && styles.cardSelected]}
                                        onPress={() => setSelectedDuelId(duelo.id)}
                                    >
                                        {duelo.planet?.image && (
                                            <Image
                                                source={{ uri: duelo.planet.image }}
                                                style={styles.planetImage}
                                                resizeMode="cover"
                                            />
                                        )}
                                        <Text style={styles.cardTitle}>{duelo.planet?.name ?? '—'}</Text>
                                        <Text style={styles.cardMeta}>{getDifficultyLabel(duelo.difficultyId)}</Text>
                                    </TouchableOpacity>
                                )
                            }}
                        />
                    )}

                    <TouchableOpacity
                        style={[styles.primaryButton, !puedeEmpezar && styles.primaryButtonDisabled]}
                        onPress={empezar}
                        disabled={!puedeEmpezar}
                    >
                        <Text style={styles.primaryButtonText}>Empezar Batalla</Text>
                    </TouchableOpacity>

                </ScrollView>
            </SafeAreaView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0e1a' },
    safeArea: { flex: 1, paddingHorizontal: 20 },
    content: { paddingBottom: 40 },

    title: { color: '#fff', fontSize: 28, fontWeight: '900', marginTop: 24, letterSpacing: 1 },
    subtitle: { color: '#7d8ca3', fontSize: 14, marginTop: 6, marginBottom: 20 },

    label: { color: '#fff', fontSize: 16, fontWeight: '700', marginTop: 20, marginBottom: 10 },

    message: { color: '#7d8ca3', textAlign: 'center', marginVertical: 16 },

    card: {
        backgroundColor: '#02142b',
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#1a2942',
        padding: 12,
        marginRight: 12,
        width: 180,
        alignItems: 'center',
    },
    cardSelected: { borderColor: '#2db4ff' },
    cardTitle: { color: '#fff', fontSize: 15, fontWeight: '800', marginBottom: 6 },
    cardMeta: { color: '#7d8ca3', fontSize: 12 },

    avatarRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'center' },
    avatarFrame: { width: 36, height: 36, borderRadius: 8, overflow: 'hidden', backgroundColor: '#1a2942' },
    avatar: { width: '100%', height: '100%', resizeMode: 'contain'},

    planetImage: { width: 80, height: 80, borderRadius: 10, marginBottom: 8, backgroundColor: '#1a2942' },

    primaryButton: {
        backgroundColor: '#afe2ff',
        borderRadius: 24,
        padding: 18,
        marginTop: 30,
        alignItems: 'center',
    },
    primaryButtonDisabled: { opacity: 0.4 },
    primaryButtonText: { color: '#0a0e1a', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
})
