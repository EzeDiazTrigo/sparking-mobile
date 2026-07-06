import React, { useEffect, useState } from 'react'
import {
    View,
    Text,
    Image,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { useRouter } from 'expo-router'
import { SPRITES } from '../constants/sprites'

const CHARACTERS_URL = 'https://dragonball-api.com/api/characters'

const difficulties = [
    { id: 1, label: 'Fácil', multiplier: 1 },
    { id: 2, label: 'Media', multiplier: 1.3 },
    { id: 3, label: 'Difícil', multiplier: 1.5 },
]

const getDifficulty = (id) => difficulties.find(d => d.id === id) ?? difficulties[0]

const ESCALAS = {
    million: 1_000_000,
    billion: 1_000_000_000,
    trillion: 1_000_000_000_000,
    quadrillion: 1e15,
    quintillion: 1e18,
    sextillion: 1e21,
    septillion: 1e24,
    octillion: 1e27,
    nonillion: 1e30,
    googolplex: Infinity,
}

const MAX_KI = 1_000_000_000

const parseKi = (val) => {
    if (typeof val === 'number') return Math.min(val, MAX_KI)
    if (!val || typeof val !== 'string') return 0

    const str = val.trim().toLowerCase()

    if (str === 'unknown' || str === '?' || str === '-') return 0

    if (/^[\d.,\s]+$/.test(str)) {
        const numero = Number(str.replace(/[.,\s]/g, '')) || 0
        return Math.min(numero, MAX_KI)
    }

    const match = str.match(/^([\d.,]+)\s+(\w+)/)
    if (match) {
        const numero = parseFloat(match[1].replace(/,/g, '.')) || 0
        const escala = ESCALAS[match[2]] ?? 1
        const total = numero * escala
        return Math.min(total, MAX_KI)
    }

    return 0
}

const formatKi = (n) => Number(n).toLocaleString('es-AR')

export default function Batalla({ equipo, duelo, enemyTeam }) {
    const router = useRouter()

    const [equipoEstado, setEquipoEstado] = useState([])
    const [enemigos, setEnemigos] = useState([])
    const [indicePersonaje, setIndicePersonaje] = useState(null)
    const [indiceEnemigo, setIndiceEnemigo] = useState(null)
    const [cargando, setCargando] = useState(true)
    const [resultado, setResultado] = useState(null)

    const dificultad = getDifficulty(duelo.difficultyId)
    const esPvp = !!enemyTeam
    const puedeAtacar = indicePersonaje !== null && indiceEnemigo !== null

    useEffect(() => {
        const inicializar = async () => {
            try {
                setCargando(true)

                const equipoInicial = (equipo.characters ?? []).map(p => ({
                    ...p,
                    ki: Number(p.ki),
                    vivo: true,
                }))
                setEquipoEstado(equipoInicial)

                if (esPvp) {
                    const rivales = (enemyTeam.characters ?? []).map(e => {
                        const kiBase = Number(e.ki) || 0
                        return {
                            ...e,
                            kiActual: Math.floor(kiBase * dificultad.multiplier),
                            kiInicial: Math.floor(kiBase * dificultad.multiplier),
                            vivo: true,
                            esRival: true,
                        }
                    })
                    setEnemigos(rivales)
                    return
                }

                const res = await fetch(`${CHARACTERS_URL}?limit=100`)
                const data = await res.json()
                const all = Array.isArray(data.items) ? data.items : []
                const mezclados = [...all].sort(() => Math.random() - 0.5)
                const cantidadEnemigos = Math.floor(Math.random() * 5) + 1
                const random5 = mezclados.slice(0, cantidadEnemigos).map(e => {
                    const kiBase = parseKi(e.ki)
                    return {
                        ...e,
                        kiActual: Math.floor(kiBase * dificultad.multiplier),
                        kiInicial: Math.floor(kiBase * dificultad.multiplier),
                        vivo: true,
                    }
                })
                setEnemigos(random5)
            } catch (error) {
                console.log('Error al inicializar batalla:', error)
            } finally {
                setCargando(false)
            }
        }
        inicializar()
    }, [])

    const atacar = () => {
        if (resultado !== null || cargando) return
        if (indicePersonaje === null || indiceEnemigo === null) return

        const personaje = equipoEstado[indicePersonaje]
        const enemigo = enemigos[indiceEnemigo]
        if (!personaje || !enemigo || !personaje.vivo || !enemigo.vivo) return

        const kiP = personaje.ki
        const kiE = enemigo.kiActual

        let nuevoEquipo = equipoEstado
        let nuevosEnemigos = enemigos
        let personajeMurio = false
        let enemigoMurio = false

        if (kiP > kiE) {
            nuevosEnemigos = enemigos.map((e, i) =>
                i === indiceEnemigo ? { ...e, kiActual: 0, vivo: false } : e
            )
            nuevoEquipo = equipoEstado.map((p, i) =>
                i === indicePersonaje ? { ...p, ki: kiP - kiE } : p
            )
            enemigoMurio = true
        } else if (kiE > kiP) {
            nuevosEnemigos = enemigos.map((e, i) =>
                i === indiceEnemigo ? { ...e, kiActual: kiE - kiP } : e
            )
            nuevoEquipo = equipoEstado.map((p, i) =>
                i === indicePersonaje ? { ...p, vivo: false } : p
            )
            personajeMurio = true
        } else {
            nuevosEnemigos = enemigos.map((e, i) =>
                i === indiceEnemigo ? { ...e, kiActual: 0, vivo: false } : e
            )
            nuevoEquipo = equipoEstado.map((p, i) =>
                i === indicePersonaje ? { ...p, vivo: false } : p
            )
            personajeMurio = true
            enemigoMurio = true
        }

        setEquipoEstado(nuevoEquipo)
        setEnemigos(nuevosEnemigos)
        if (personajeMurio) setIndicePersonaje(null)
        if (enemigoMurio) setIndiceEnemigo(null)

        const sinEnemigos = nuevosEnemigos.every(e => !e.vivo)
        const sinPersonajes = nuevoEquipo.every(p => !p.vivo)

        if (sinEnemigos && sinPersonajes) setResultado('empate')
        else if (sinEnemigos) setResultado('victoria')
        else if (sinPersonajes) setResultado('derrota')
    }

    const salir = () => router.replace('/(tabs)/Home')

    return (
        <View style={styles.container}>
            <StatusBar hidden />

            {duelo.planet?.image && (
                <Image
                    source={{ uri: duelo.planet.image }}
                    style={styles.background}
                    resizeMode="cover"
                />
            )}
            <View style={styles.overlay} />

            <SafeAreaView style={styles.safeArea}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

                    <View style={styles.header}>
                        <Text style={styles.title}>{duelo.planet?.name ?? 'Batalla'}</Text>
                        <Text style={styles.subtitle}>Dificultad: {dificultad.label} (x{dificultad.multiplier})</Text>
                    </View>

                    {cargando && <Text style={styles.message}>Buscando oponentes...</Text>}

                    {!cargando && (
                        <>
                            <Text style={styles.sectionLabel}>Oponentes</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
                                {enemigos.map((e, i) => {
                                    const seleccionado = i === indiceEnemigo && resultado === null && e.vivo
                                    return (
                                        <TouchableOpacity
                                            key={e.id}
                                            disabled={!e.vivo || resultado !== null}
                                            onPress={() => setIndiceEnemigo(i)}
                                            style={[
                                                styles.fighterCard,
                                                seleccionado && styles.fighterCardActive,
                                                !e.vivo && styles.fighterCardDead,
                                            ]}
                                        >
                                            {e.esRival ? (
                                                <View style={styles.allyImageFrame}>
                                                    <Image
                                                        source={SPRITES[e.image] || { uri: '' }}
                                                        style={[styles.allyImage, !e.vivo && styles.imageDead]}
                                                        resizeMode="cover"
                                                    />
                                                </View>
                                            ) : (
                                                <Image
                                                    source={{ uri: e.image }}
                                                    style={[styles.enemyImage, !e.vivo && styles.imageDead]}
                                                    resizeMode="contain"
                                                />
                                            )}
                                            <Text style={styles.fighterName} numberOfLines={1}>{e.name}</Text>
                                            <Text style={styles.fighterKi}>{formatKi(e.kiActual)}</Text>
                                        </TouchableOpacity>
                                    )
                                })}
                            </ScrollView>

                            <Text style={styles.sectionLabel}>Tu equipo: {equipo.name}</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
                                {equipoEstado.map((p, i) => {
                                    const seleccionado = i === indicePersonaje && resultado === null && p.vivo
                                    return (
                                        <TouchableOpacity
                                            key={p.id}
                                            disabled={!p.vivo || resultado !== null}
                                            onPress={() => setIndicePersonaje(i)}
                                            style={[
                                                styles.fighterCard,
                                                seleccionado && styles.fighterCardActive,
                                                !p.vivo && styles.fighterCardDead,
                                            ]}
                                        >
                                            <View style={styles.allyImageFrame}>
                                                <Image
                                                    source={SPRITES[p.image] || { uri: '' }}
                                                    style={[styles.allyImage, !p.vivo && styles.imageDead]}
                                                    resizeMode="cover"
                                                />
                                            </View>
                                            <Text style={styles.fighterName} numberOfLines={1}>{p.name}</Text>
                                            <Text style={styles.fighterKi}>{formatKi(p.ki)}</Text>
                                        </TouchableOpacity>
                                    )
                                })}
                            </ScrollView>

                            {resultado === null && (
                                <TouchableOpacity
                                    style={[styles.attackButton, !puedeAtacar && styles.attackButtonDisabled]}
                                    onPress={atacar}
                                    disabled={!puedeAtacar}
                                >
                                    <Text style={styles.attackButtonText}>Atacar</Text>
                                </TouchableOpacity>
                            )}

                            {resultado !== null && (
                                <View style={[
                                    styles.resultadoBox,
                                    resultado === 'victoria' && styles.resultadoVictoria,
                                    resultado === 'derrota' && styles.resultadoDerrota,
                                    resultado === 'empate' && styles.resultadoEmpate,
                                ]}>
                                    <Text style={styles.resultadoText}>
                                        {resultado === 'victoria' && '¡Ganaste!'}
                                        {resultado === 'derrota' && 'Derrota'}
                                        {resultado === 'empate' && 'Empate'}
                                    </Text>
                                </View>
                            )}

                            <TouchableOpacity style={styles.exitButton} onPress={salir}>
                                <Text style={styles.exitButtonText}>Salir al menú</Text>
                            </TouchableOpacity>
                        </>
                    )}

                </ScrollView>
            </SafeAreaView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0e1a' },

    background: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },

    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(10, 14, 26, 0.55)',
    },

    safeArea: { flex: 1, paddingHorizontal: 16 },
    content: { paddingBottom: 40 },

    header: { marginTop: 20, marginBottom: 16 },
    title: { color: '#fff', fontSize: 30, fontWeight: '900', letterSpacing: 1, textShadowColor: '#000', textShadowRadius: 6 },
    subtitle: { color: '#dbeafe', fontSize: 14, marginTop: 4, textShadowColor: '#000', textShadowRadius: 4 },

    message: { color: '#fff', textAlign: 'center', marginVertical: 24, fontSize: 15 },

    sectionLabel: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
        marginTop: 22,
        marginBottom: 10,
        textShadowColor: '#000',
        textShadowRadius: 4,
    },

    row: { gap: 10, paddingRight: 10 },

    fighterCard: {
        backgroundColor: 'rgba(2, 20, 43, 0.85)',
        borderRadius: 14,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
        padding: 10,
        width: 110,
        alignItems: 'center',
    },
    fighterCardActive: {
        borderColor: '#2db4ff',
        shadowColor: '#2db4ff',
        shadowOpacity: 0.8,
        shadowRadius: 12,
        elevation: 8,
    },
    fighterCardDead: { opacity: 0.5 },

    enemyImage: {
        width: 80,
        height: 80,
        marginBottom: 6,
    },

    allyImageFrame: {
        width: 80,
        height: 80,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#1a2942',
        marginBottom: 6,
    },
    allyImage: { width: '100%', height: '100%' },

    imageDead: { opacity: 0.3 },

    fighterName: { color: '#fff', fontSize: 13, fontWeight: '800', textAlign: 'center' },
    fighterKi: { color: '#dbeafe', fontSize: 11, marginTop: 2 },

    attackButton: {
        backgroundColor: '#ef4444',
        borderRadius: 24,
        padding: 18,
        marginTop: 28,
        alignItems: 'center',
        shadowColor: '#ef4444',
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 6,
    },
    attackButtonText: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
    attackButtonDisabled: { opacity: 0.4, shadowOpacity: 0 },

    resultadoBox: {
        marginTop: 24,
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
    },
    resultadoVictoria: { backgroundColor: 'rgba(34, 197, 94, 0.85)' },
    resultadoDerrota: { backgroundColor: 'rgba(239, 68, 68, 0.85)' },
    resultadoEmpate: { backgroundColor: 'rgba(100, 116, 139, 0.85)' },
    resultadoText: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: 1 },

    exitButton: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 24,
        padding: 14,
        marginTop: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.18)',
    },
    exitButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
})
