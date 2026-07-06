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

const USERS_URL = 'https://6a2898d24e1e783349a5aeca.mockapi.io/sp/users'
const TEAM_URL = 'https://6a2898d24e1e783349a5aeca.mockapi.io/sp'
const ALL_TEAMS_URL = 'https://6a2898d24e1e783349a5aeca.mockapi.io/sp/team'
const DUEL_URL = 'https://6a2b50c3b687a7d5cbc51cc1.mockapi.io/sp/duel'

const MAX_RESHUFFLES = 1

const difficulties = [
    { id: 1, label: 'Fácil' },
    { id: 2, label: 'Media' },
    { id: 3, label: 'Difícil' },
]

const getDifficultyLabel = (id) => {
    return difficulties.find(d => d.id === id)?.label ?? 'Desconocida'
}

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5)
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)]

const sortearAdversarios = (poolAdversarios) =>
    shuffle(poolAdversarios).slice(0, 3).map(item => ({
        user: item.user,
        team: pickRandom(item.teams),
    }))

export default function ConfiguracionBatalla({ onStart }) {
    const { user } = useAuth()
    const [teams, setTeams] = useState([])
    const [duels, setDuels] = useState([])
    const [selectedTeamId, setSelectedTeamId] = useState(null)
    const [selectedDuelId, setSelectedDuelId] = useState(null)
    const [cargando, setCargando] = useState(true)

    const [modo, setModo] = useState('cpu')
    const [usuariosConEquipo, setUsuariosConEquipo] = useState([])
    const [adversarios, setAdversarios] = useState([])
    const [selectedOpponentId, setSelectedOpponentId] = useState(null)
    const [reshuffleCount, setReshuffleCount] = useState(0)
    const [pvpDisponible, setPvpDisponible] = useState(null)
    const [pvpCargando, setPvpCargando] = useState(false)
    const [pvpError, setPvpError] = useState(null)

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

    const cargarPoolPvp = async () => {
        if (usuariosConEquipo.length > 0 || pvpCargando) return
        try {
            setPvpCargando(true)
            setPvpError(null)
            const [usersRes, teamsRes] = await Promise.all([
                fetch(USERS_URL),
                fetch(ALL_TEAMS_URL),
            ])
            const usersData = await usersRes.json()
            const teamsData = await teamsRes.json()

            const otros = (Array.isArray(usersData) ? usersData : [])
                .filter(u => String(u.id) !== String(user.id))

            const teamsPorUsuario = new Map()
            for (const t of (Array.isArray(teamsData) ? teamsData : [])) {
                if (String(t.userId) === String(user.id)) continue
                const arr = teamsPorUsuario.get(String(t.userId)) ?? []
                arr.push(t)
                teamsPorUsuario.set(String(t.userId), arr)
            }

            const pool = otros
                .map(u => ({ user: u, teams: teamsPorUsuario.get(String(u.id)) ?? [] }))
                .filter(item => item.teams.length > 0)

            setUsuariosConEquipo(pool)

            if (pool.length < 3) {
                setPvpDisponible(false)
                setAdversarios([])
            } else {
                setPvpDisponible(true)
                setAdversarios(sortearAdversarios(pool))
            }
        } catch (error) {
            console.log('Error al cargar adversarios:', error)
            setPvpError('No se pudieron cargar los adversarios.')
            setPvpDisponible(false)
        } finally {
            setPvpCargando(false)
        }
    }

    const reshuffle = () => {
        if (reshuffleCount >= MAX_RESHUFFLES) return
        if (usuariosConEquipo.length < 3) return
        setAdversarios(sortearAdversarios(usuariosConEquipo))
        setSelectedOpponentId(null)
        setReshuffleCount(c => c + 1)
    }

    const cambiarModo = (nuevo) => {
        if (nuevo === modo) return
        setModo(nuevo)
        if (nuevo === 'cpu') {
            setSelectedOpponentId(null)
        } else {
            cargarPoolPvp()
        }
    }

    const empezar = () => {
        const equipo = teams.find(t => String(t.id) === String(selectedTeamId))
        const duelo = duels.find(d => String(d.id) === String(selectedDuelId))
        if (!equipo || !duelo) return
        if (modo === 'cpu') {
            onStart({ equipo, duelo })
            return
        }
        const adv = adversarios.find(a => String(a.user.id) === String(selectedOpponentId))
        if (!adv) return
        onStart({ equipo, duelo, enemyTeam: adv.team, opponent: adv.user })
    }

    const puedeEmpezar =
        selectedTeamId !== null &&
        selectedDuelId !== null &&
        (modo === 'cpu' || (pvpDisponible === true && selectedOpponentId !== null))

    return (
        <View style={styles.container}>
            <StatusBar hidden />

            <SafeAreaView style={styles.safeArea}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

                    <Text style={styles.title}>Configurar Batalla</Text>
                    <Text style={styles.subtitle}>Elegí contra quién pelear y tu equipo.</Text>

                    <View style={styles.toggleRow}>
                        <TouchableOpacity
                            style={[styles.togglePill, modo === 'cpu' && styles.togglePillActive]}
                            onPress={() => cambiarModo('cpu')}
                        >
                            <Text style={[styles.togglePillText, modo === 'cpu' && styles.togglePillTextActive]}>CPU</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.togglePill, modo === 'pvp' && styles.togglePillActive]}
                            onPress={() => cambiarModo('pvp')}
                        >
                            <Text style={[styles.togglePillText, modo === 'pvp' && styles.togglePillTextActive]}>Jugador</Text>
                        </TouchableOpacity>
                    </View>

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
                                                        resizeMode="cover"
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

                    {modo === 'pvp' && (
                        <>
                            <Text style={styles.label}>Adversario</Text>

                            {pvpCargando && <Text style={styles.message}>Buscando adversarios...</Text>}

                            {!pvpCargando && pvpError && (
                                <Text style={styles.message}>{pvpError}</Text>
                            )}

                            {!pvpCargando && !pvpError && pvpDisponible === false && (
                                <Text style={styles.message}>Multijugador no disponible.</Text>
                            )}

                            {!pvpCargando && pvpDisponible === true && adversarios.length > 0 && (
                                <>
                                    <FlatList
                                        data={adversarios}
                                        horizontal
                                        keyExtractor={(item) => String(item.user.id)}
                                        showsHorizontalScrollIndicator={false}
                                        renderItem={({ item: adv }) => {
                                            const seleccionado = String(adv.user.id) === String(selectedOpponentId)
                                            return (
                                                <TouchableOpacity
                                                    style={[styles.card, seleccionado && styles.cardSelected]}
                                                    onPress={() => setSelectedOpponentId(adv.user.id)}
                                                >
                                                    <Text style={styles.cardTitle} numberOfLines={1}>{adv.user.username}</Text>
                                                    <Text style={styles.cardMeta} numberOfLines={1}>{adv.team.name}</Text>
                                                    <View style={styles.avatarRow}>
                                                        {Array.isArray(adv.team.characters) && adv.team.characters.slice(0, 5).map((c) => (
                                                            <View key={c.id} style={styles.avatarFrame}>
                                                                <Image
                                                                    source={SPRITES[c.image] || { uri: '' }}
                                                                    style={styles.avatar}
                                                                    resizeMode="cover"
                                                                />
                                                            </View>
                                                        ))}
                                                    </View>
                                                </TouchableOpacity>
                                            )
                                        }}
                                    />
                                    <TouchableOpacity
                                        style={[styles.reshuffleButton, reshuffleCount >= MAX_RESHUFFLES && styles.reshuffleButtonDisabled]}
                                        onPress={reshuffle}
                                        disabled={reshuffleCount >= MAX_RESHUFFLES}
                                    >
                                        <Text style={styles.reshuffleButtonText}>Otros adversarios</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </>
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

    toggleRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
    togglePill: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#1a2942',
        backgroundColor: '#02142b',
        alignItems: 'center',
    },
    togglePillActive: { borderColor: '#2db4ff', backgroundColor: '#0a2544' },
    togglePillText: { color: '#7d8ca3', fontSize: 14, fontWeight: '800' },
    togglePillTextActive: { color: '#fff' },

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
    cardMeta: { color: '#7d8ca3', fontSize: 12, marginBottom: 6 },

    avatarRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'center' },
    avatarFrame: { width: 36, height: 36, borderRadius: 8, overflow: 'hidden', backgroundColor: '#1a2942' },
    avatar: { width: '100%', height: '100%' },

    planetImage: { width: 80, height: 80, borderRadius: 10, marginBottom: 8, backgroundColor: '#1a2942' },

    reshuffleButton: {
        marginTop: 12,
        alignSelf: 'flex-start',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 16,
        backgroundColor: 'rgba(45, 180, 255, 0.15)',
        borderWidth: 1,
        borderColor: '#2db4ff',
    },
    reshuffleButtonDisabled: { opacity: 0.4 },
    reshuffleButtonText: { color: '#afe2ff', fontSize: 13, fontWeight: '700' },

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
