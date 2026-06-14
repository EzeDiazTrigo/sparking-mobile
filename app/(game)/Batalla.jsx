import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Image,
    ImageBackground,
} from 'react-native';

import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import TopBar from '../../src/components/TopBar';

const AVATAR_PLACEHOLDER = 'https://static.vecteezy.com/system/resources/thumbnails/053/406/424/small/person-gray-photo-placeholder-man-on-gray-background-avatar-man-icon-anonymous-user-male-no-photo-web-template-default-user-picture-for-social-networks-social-media-resume-forums-free-vector.jpg'


export default function Batalla() {

    /*
        Datos propios
    */
    const [allies, setAllies] = useState([]);
    const [allyHp, setAllyHp] = useState(0);
    const [allyMaxHp, setAllyMaxHp] = useState(0);

    /*
        Datos enemigos
    */
    const [enemies, setEnemies] = useState([]);
    const [enemyHp, setEnemyHp] = useState(0);
    const [enemyMaxHp, setEnemyMaxHp] = useState(0);

    /*
        Configuración del duelo
    */
    const [planet, setPlanet] = useState(null);
    const [difficulty, setDifficulty] = useState(null);

    /*
        Métodos a implementar
    */
    const cargarBatalla = () => {};

    const atacar = () => {};

    const finalizarBatalla = () => {};

    const calcularVida = () => {};

    useEffect(() => {
        cargarBatalla();
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar hidden />

            <SafeAreaView style={styles.safeArea}>

                <TopBar />

                <View style={styles.header}>
                    <Text style={styles.title}>
                        Batalla
                    </Text>

                    <Text style={styles.subtitle}>
                        {difficulty || 'Dificultad'}
                    </Text>
                </View>

                <ImageBackground
                    source={
                        planet
                            ? { uri: planet.image }
                            : undefined
                    }
                    style={styles.battlefield}
                    imageStyle={styles.planetImage}
                >

                    <Text style={styles.enemyHp}>
                        ❤️ {enemyHp} / {enemyMaxHp}
                    </Text>

                    <View style={styles.enemyRow}>
                        {enemies.map((enemy, index) => (
                            <View
                                key={enemy.id ?? index}
                                style={styles.characterSlot}
                            >
                                <Image
                                    source={{
                                        uri:
                                            enemy.image ||
                                            AVATAR_PLACEHOLDER,
                                    }}
                                    style={styles.characterImage}
                                />
                            </View>
                        ))}
                    </View>

                    <View style={styles.spacer} />

                    <View style={styles.allyRow}>
                        {allies.map((ally, index) => (
                            <View
                                key={ally.id ?? index}
                                style={styles.characterSlot}
                            >
                                <Image
                                    source={{
                                        uri:
                                            ally.image ||
                                            AVATAR_PLACEHOLDER,
                                    }}
                                    style={styles.characterImage}
                                />
                            </View>
                        ))}
                    </View>

                    <Text style={styles.allyHp}>
                        💙 {allyHp} / {allyMaxHp}
                    </Text>

                </ImageBackground>

                <TouchableOpacity
                    style={styles.attackButton}
                    onPress={atacar}
                >
                    <MaterialCommunityIcons
                        name="sword-cross"
                        size={24}
                        color="#0a0e1a"
                    />

                    <Text style={styles.attackButtonText}>
                        Atacar
                    </Text>
                </TouchableOpacity>

            </SafeAreaView>
        </View>
    );
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

    header: {
        marginTop: 15,
        marginBottom: 20,
    },

    title: {
        color: '#fff',
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: 2,
    },

    subtitle: {
        color: '#7d8ca3',
        marginTop: 4,
    },

    battlefield: {
        flex: 1,
        borderRadius: 20,
        overflow: 'hidden',
        justifyContent: 'space-between',
        paddingVertical: 25,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#1a2942',
    },

    planetImage: {
        resizeMode: 'cover',
    },

    enemyHp: {
        color: '#ff4b4b',
        fontSize: 24,
        fontWeight: '900',
        textAlign: 'center',
    },

    allyHp: {
        color: '#38bdf8',
        fontSize: 24,
        fontWeight: '900',
        textAlign: 'center',
    },

    enemyRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },

    allyRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },

    spacer: {
        flex: 1,
    },

    characterSlot: {
        width: 60,
        height: 60,
        borderRadius: 16,
        backgroundColor: 'rgba(10,14,26,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    characterImage: {
        width: 70,
        height: 70,
        resizeMode: 'contain',
    },

    attackButton: {
        backgroundColor: '#afe2ff',
        borderRadius: 24,
        padding: 18,
        marginVertical: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },

    attackButtonText: {
        color: '#0a0e1a',
        fontSize: 20,
        fontWeight: '900',
    },
});