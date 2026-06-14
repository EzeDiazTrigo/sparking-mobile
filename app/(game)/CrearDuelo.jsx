import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    FlatList,
    ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const difficulties = [
        { id: 1, label: 'Fácil', multiplier: 1 },
        { id: 2, label: 'Media', multiplier: 1.3 },
        { id: 3, label: 'Difícil', multiplier: 1.5 },
    ];

export default function Duelos() {
    const [difficulty, setDifficulty] = useState(null);
    const [planet, setPlanet] = useState(null);
    const [duels, setDuels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPlanet, setSelectedPlanet] = useState(null);

    const traerPlanetas = async () => {
      try{

        const url = `https://dragonball-api.com/api/planets`
        const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

        const data = await response.json();

        setPlanet(data.items);
      }catch(error){
        console.log("Error al traer planetas: ", error);
        setPlanet([])
      }
        
    }

    useEffect(() => {
                traerPlanetas()
        }, [])
    // Implementar después
    const crearDuelo = () => {};

    const cargarDuelo = () => {};

    const editarDuelo = () => {};

    const borrarDuelo = () => {};

    useEffect(() => {
        cargarDuelo();
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar hidden />

            <SafeAreaView style={styles.safeArea}>
                <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
    >
        <Text style={styles.title}>Duelos</Text>

        <Text style={styles.subtitle}>
            Configurá un nuevo enfrentamiento.
        </Text>
        
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>
                            Crear duelo
                        </Text>

                        <MaterialCommunityIcons
                            name="sword"
                            size={24}
                            color="#38bdf8"
                        />
                    </View>

                    <Text style={styles.sectionLabel}>
                        Dificultad
                    </Text>

                    <View style={styles.optionsRow}>
                        {difficulties.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={[
                                    styles.optionButton,
                                    difficulty === item.id &&
                                        styles.optionButtonSelected,
                                ]}
                                onPress={() =>
                                    setDifficulty(item.id)
                                }
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        difficulty === item.id &&
                                            styles.optionTextSelected,
                                    ]}
                                >
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.sectionLabel}>
                        Planeta
                    </Text>

                    <FlatList
                        data={planet}
                        keyExtractor={(item) => item.id.toString()}
                        numColumns={2}
                        scrollEnabled={false}
                        contentContainerStyle={styles.planetsGrid}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.planetCard,
                                    selectedPlanet === item.id && styles.planetCardSelected,
                                ]}
                                onPress={() => setSelectedPlanet(item.id)}
                            >
                                <Image
                                    source={{ uri: item.image }}
                                    style={styles.planetImage}
                                    resizeMode="cover"
                                />

                                <Text
                                    style={[
                                        styles.planetText,
                                        selectedPlanet === item.id &&
                                            styles.planetTextSelected,
                                    ]}
                                >
                                    {item.name}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />

                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={crearDuelo}
                    >
                        <Text style={styles.primaryButtonText}>
                            Crear duelo
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.sectionTitleRow}>
                    <Text style={styles.sectionTitle}>
                        Duelos creados
                    </Text>

                    <Text style={styles.badge}>
                        {duels.length}
                    </Text>
                </View>

                {loading ? (
                    <Text style={styles.emptyText}>
                        Cargando duelos...
                    </Text>
                ) : duels.length === 0 ? (
                    <Text style={styles.emptyText}>
                        No hay duelos creados todavía.
                    </Text>
                ) : (
                    duels.map((duel) => (
                        <View
                            key={duel.id}
                            style={styles.duelCard}
                        >
                            <View style={styles.duelInfo}>
                                <Text style={styles.duelTitle}>
                                    {duel.name}
                                </Text>

                                <Text style={styles.duelMeta}>
                                    {duel.difficulty} • {duel.planet}
                                </Text>
                            </View>

                            <View style={styles.inlineButtons}>
                                <TouchableOpacity
                                    style={styles.iconButton}
                                    onPress={() =>
                                        editarDuelo(duel)
                                    }
                                >
                                    <MaterialCommunityIcons
                                        name="pencil"
                                        size={18}
                                        color="#0a0e1a"
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.iconButtonDanger}
                                    onPress={() =>
                                        borrarDuelo(duel.id)
                                    }
                                >
                                    <MaterialCommunityIcons
                                        name="delete"
                                        size={18}
                                        color="#fff"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
                </ScrollView>
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

    title: {
        color: '#fff',
        fontSize: 32,
        fontWeight: '900',
        marginTop: 30,
        letterSpacing: 2,
    },

    subtitle: {
        color: '#7d8ca3',
        fontSize: 15,
        marginTop: 6,
        marginBottom: 20,
    },

    card: {
        backgroundColor: '#02142b',
        borderRadius: 16,
        padding: 18,
        borderWidth: 1,
        borderColor: '#1a2942',
    },

    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },

    cardTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '900',
    },

    sectionLabel: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
        marginTop: 10,
    },

    optionsRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
    },

    optionButton: {
        flex: 1,
        backgroundColor: '#0a0e1a',
        borderWidth: 1,
        borderColor: '#1a2942',
        borderRadius: 20,
        paddingVertical: 14,
        alignItems: 'center',
    },

    optionButtonSelected: {
        backgroundColor: '#38bdf8',
    },

    optionText: {
        color: '#fff',
        fontWeight: '700',
    },

    optionTextSelected: {
        color: '#0a0e1a',
    },

    planetsGrid: {
        gap: 12,
    },

    planetCard: {
        flex: 1,
        backgroundColor: '#0a0e1a',
        borderRadius: 14,
        padding: 16,
        margin: 6,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#1a2942',
    },

    planetCardSelected: {
        backgroundColor: '#38bdf8',
    },

    planetImage: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: '#1a2942',
    },

    planetText: {
        color: '#fff',
        fontWeight: '700',
        marginTop: 8,
        textAlign: 'center',
    },

    planetTextSelected: {
        color: '#0a0e1a',
    },

    primaryButton: {
        backgroundColor: '#afe2ff',
        borderRadius: 24,
        padding: 18,
        marginTop: 24,
        alignItems: 'center',
    },

    primaryButtonText: {
        color: '#0a0e1a',
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 1,
    },

    sectionTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 14,
    },

    sectionTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '900',
    },

    badge: {
        backgroundColor: '#1f6feb',
        color: '#fff',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        fontWeight: '700',
    },

    emptyText: {
        color: '#7d8ca3',
        textAlign: 'center',
        marginTop: 20,
        fontSize: 15,
    },

    duelCard: {
        backgroundColor: '#02142b',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#1a2942',
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    duelInfo: {
        flex: 1,
    },

    duelTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
    },

    duelMeta: {
        color: '#7d8ca3',
        marginTop: 4,
    },

    inlineButtons: {
        flexDirection: 'row',
        gap: 8,
    },

    iconButton: {
        backgroundColor: '#afe2ff',
        borderRadius: 12,
        padding: 10,
    },

    iconButtonDanger: {
        backgroundColor: '#ef4444',
        borderRadius: 12,
        padding: 10,
    },
});