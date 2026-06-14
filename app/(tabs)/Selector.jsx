import React, { useEffect, useState } from 'react';
import {
  Image,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import TopBar from '../../src/components/TopBar';
import { useAuth } from '../../src/context/AuthContext';
import { SPRITES } from '../../src/constants/sprites'

const STORAGE_KEY = 'sparking_teams';
const AVATAR_PLACEHOLDER = 'https://static.vecteezy.com/system/resources/thumbnails/053/406/424/small/person-gray-photo-placeholder-man-on-gray-background-avatar-man-icon-anonymous-user-male-no-photo-web-template-default-user-picture-for-social-networks-social-media-resume-forums-free-vector.jpg'


const normalizeTeamFromApi = (entry) => {
    if (!entry || typeof entry !== 'object') {
        return null;
    }

    const candidate = entry?.[0] && typeof entry[0] === 'object'
        ? entry[0]
        : entry;

    const characters = Array.isArray(candidate?.characters)
        ? candidate.characters
        : (Array.isArray(entry?.characters)
            ? entry.characters
            : (Array.isArray(entry?.characteres)
                ? entry.characteres
                : []));

    return {
        ...candidate,
        ...entry,
        id: candidate?.id ?? entry?.id,
        name: candidate?.name ?? entry?.name ?? 'Equipo',
        members: candidate?.members ?? entry?.members ?? characters.length,
        characters,
        status: candidate?.status ?? entry?.status ?? 'Guardado',
    };
};

export default function Selector({ characters = null }) {
    const [personajes, setPersonajes] = useState([])
    const [cargando, setCargando] = useState(true)
    const { user } = useAuth();
    const [teams, setTeams] = useState([]);
    const [teamName, setTeamName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedCharacterIds, setSelectedCharacterIds] = useState([]);

    const traerPersonajes = async () => {
      try{
        setCargando(true)

        if (!user?.id) {
                setTeams([]);
                return;
            }

        const url = `https://6a2b50c3b687a7d5cbc51cc1.mockapi.io/sp/character?userId=${user.id}`
        const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

        const data = await response.json()
        const rawCharacteres = Array.isArray(data) ? data : (data ? [data] : []);
        setPersonajes(rawCharacteres)
        setCargando(false)
      }catch(error){
        console.log("Error al traer personajes: ", error);
        setPersonajes([])
        setCargando(false)
      }
        
    }

    useEffect(() => {
            traerPersonajes()
    }, [])

    characters = personajes;
    const availableCharacters = Array.isArray(characters) && characters.length > 0
      ? characters
      : [personajes];

    useEffect(() => {
        if (!user?.id) {
            setLoading(false);
            return;
        }

        cargarEquipos();
    }, [user]);

    const cargarEquipos = async () => {
        try {
            if (!user?.id) {
                setTeams([]);
                return;
            }

            const url = `https://6a2898d24e1e783349a5aeca.mockapi.io/sp/users/${user.id}/team`;
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}`);
            }

            const data = await response.json();
            const rawTeams = Array.isArray(data) ? data : (data ? [data] : []);
            const normalizedTeams = rawTeams
              .map((entry) => normalizeTeamFromApi(entry))
              .filter(Boolean);

            setTeams(normalizedTeams);
        } catch (error) {
            console.log('Error al cargar equipos:', error);
            setTeams([]);
        } finally {
            setLoading(false);
        }
    };

    const guardarEquipos = async (lista) => {
      if (!user?.id) {
        console.log('No hay usuario logueado para guardar equipos');
        return;
      }

      try {
        const response = await fetch(
          `https://6a2898d24e1e783349a5aeca.mockapi.io/sp/users/${user.id}/team`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lista),
          }
        );

        if (!response.ok) {
          throw new Error(`Error ${response.status}`);
        }

        const data = await response.json();

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        setTeams(Array.isArray(data) ? data : lista);
      } catch (error) {
        console.log('Error al guardar equipos:', error);
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
        setTeams(lista);
      } catch (storageError) {
        console.log('Error al guardar equipos en storage local:', storageError);
      }
      }
    };

    const toggleCharacter = (character) => {
        setSelectedCharacterIds((prev) => {
            const exists = prev.includes(character.id);

            if (exists) {
                return prev.filter((id) => id !== character.id);
            }

            if (prev.length >= 5) {
                return prev;
            }

            return [...prev, character.id];
        });
    };

    const createTeam = async () => {
        const nombre = teamName.trim();

        if (!nombre || selectedCharacterIds.length === 0) {
        return;
        }

        const selectedCharacters = availableCharacters.filter((character) =>
        selectedCharacterIds.includes(character.id)
        );

        const lastTeamId = teams.reduce((max, team) => {
        const numericId = Number.parseInt(String(team.id), 10);
        return Number.isFinite(numericId) && numericId > max ? numericId : max;
        }, 0);

        const nuevoEquipo = {
        id: String(lastTeamId + 1),
        name: nombre,
        members: selectedCharacters.length,
        characters: selectedCharacters,
        };

        const listaActualizada = [nuevoEquipo, ...teams];

        await guardarEquipos(nuevoEquipo);
        setTeams(listaActualizada);

        setTeamName('');
        setSelectedCharacterIds([]);
        setEditingId(null);
    };

    const updateTeam = async () => {
        const nombre = teamName.trim();
        const teamId = String(editingId ?? '');

        if (!nombre || !teamId) {
            return;
        }
        console.log('Iniciando actualización del equipo con ID:', teamId);
        try {
            const currentUserId = user?.id ?? await getStoredUserId();
            if (!currentUserId) {
                console.log('No hay usuario para actualizar el equipo');
                return;
            }

            const equipoActual = teams.find((team) => String(team.id) === teamId);
            const idsToUse = selectedCharacterIds.length > 0
                ? selectedCharacterIds
                : (Array.isArray(equipoActual?.characters)
                    ? equipoActual.characters.map((character) => String(character.id))
                    : []);

            const selectedCharacters = availableCharacters.filter((character) =>
                idsToUse.some((id) => String(character.id) === String(id))
            );

            const personajesFinales = selectedCharacters.length > 0
                ? selectedCharacters
                : (Array.isArray(equipoActual?.characters) ? equipoActual.characters : []);
            const equipoEditado = {
                ...(equipoActual || {}),
                id: teamId,
                name: nombre,
                members: personajesFinales.length,
                characters: personajesFinales,
                status: 'Editado',
                userId: String(currentUserId),
            };

            const response = await fetch(
                `https://6a2898d24e1e783349a5aeca.mockapi.io/sp/users/${currentUserId}/team/${teamId}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(equipoEditado),
                }
            );

            if (!response.ok) {
                throw new Error(`Error ${response.status}`);
            }

            const updatedTeam = await response.json();
            const normalizedUpdatedTeam = normalizeTeamFromApi(updatedTeam) ?? {
                ...equipoEditado,
                ...updatedTeam,
            };

            const listaActualizada = teams.map((team) =>
                String(team.id) === teamId ? normalizedUpdatedTeam : team
            );

            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(listaActualizada));
            setTeams(listaActualizada);
            setTeamName('');
            setEditingId(null);
            setSelectedCharacterIds([]);
        } catch (error) {
            console.log('Error al actualizar equipo:', error);
        }
    };

    const handleSave = async () => {
        if (editingId !== null && editingId !== undefined && editingId !== '') {
            await updateTeam();
        } else {
            await createTeam();
        }
    };

    const handleEdit = (team) => {
        setEditingId(team.id);
        setTeamName(team.name);
        setSelectedCharacterIds(
          Array.isArray(team.characters)
            ? team.characters.map((character) => character.id)
            : []
        );
    };

    const deleteTeam = async (teamId) => {
        try {
            const currentUserId = user?.id ?? await getStoredUserId();
            if (!currentUserId) {
                console.log('No hay usuario para borrar el equipo');
                return;
            }

            const response = await fetch(
                `https://6a2898d24e1e783349a5aeca.mockapi.io/sp/users/${currentUserId}/team/${teamId}`,
                {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                }
            );

            if (!response.ok) {
                throw new Error(`Error ${response.status}`);
            }

            const listaActualizada = teams.filter((team) => String(team.id) !== String(teamId));
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(listaActualizada));
            setTeams(listaActualizada);
        } catch (error) {
            console.log('Error al borrar equipo:', error);
            const listaActualizada = teams.filter((team) => String(team.id) !== String(teamId));
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(listaActualizada)).catch(() => {});
            setTeams(listaActualizada);
        }
    };

    const handleCancel = () => {
        setTeamName('');
        setSelectedCharacterIds([]);
        setEditingId(null);
    };

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.headerBox}>
            <TopBar />
            <Text style={styles.title}>Equipos</Text>
            <Text style={styles.subtitle}>
              Gestioná tus equipos.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{editingId ? 'Editar equipo' : 'Crear equipo'}</Text>
              <MaterialCommunityIcons name="account-group" size={22} color="#38bdf8" />
            </View>

            <TextInput
              style={styles.input}
              placeholder="Nombre del equipo"
              placeholderTextColor="#8ba1b7"
              value={teamName}
              onChangeText={setTeamName}
            />

            <View style={styles.selectorHeaderRow}>
              <Text style={styles.selectorLabel}>Selecciona entre 1 y 5 personajes</Text>
              <Text style={styles.selectorCounter}>{selectedCharacterIds.length}/5</Text>
            </View>

            <FlatList
              data={availableCharacters}
              keyExtractor={(item) => String(item.id)}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.charactersContainer}
              renderItem={({ item: character }) => {
                const selected = selectedCharacterIds.includes(character.id);

                return (
                  <TouchableOpacity
                    style={[
                      styles.characterCard,
                      selected && styles.characterCardSelected,
                    ]}
                    onPress={() => toggleCharacter(character)}
                    activeOpacity={0.9}
                  >
                    <View style={styles.characterAvatarFrame}>
                      <Image
                        source={
                          SPRITES[character.image] || { uri: AVATAR_PLACEHOLDER }
                        }
                        style={styles.characterImage}
                        resizeMode="contain"
                      />
                    </View>

                    <Text style={styles.characterName}>
                      {character.name}
                    </Text>

                    <Text style={styles.characterKi}>
                      {character.ki || 'Personaje'}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />


            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
                <Text style={styles.primaryButtonText}>
                  {editingId ? 'Guardar cambios' : 'Crear equipo'}
                </Text>
              </TouchableOpacity>

              {editingId ? (
                <TouchableOpacity style={styles.secondaryButton} onPress={handleCancel}>
                  <Text style={styles.secondaryButtonText}>Cancelar</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Equipos actuales</Text>
            <Text style={styles.badge}>{teams.length}</Text>
          </View>

          {loading ? (
            <Text style={styles.emptyText}>Cargando equipos...</Text>
          ) : teams.length === 0 ? (
            <Text style={styles.emptyText}>No hay equipos creados todavía.</Text>
          ) : (
            teams.map((team) => (
              <View key={team.id} style={styles.teamCard}>
                <View style={styles.teamInfo}>
                  <Text style={styles.teamName}>{team.name}</Text>
                  <Text style={styles.teamMeta}>
                    Personajes: {Array.isArray(team.characters) ? team.characters.length : team.members}
                  </Text>

                  {Array.isArray(team.characters) && team.characters.length > 0 ? (
                    <View style={styles.avatarRow}>
                      {team.characters.slice(0, 5).map((character) => (
                        <View key={character.id} style={styles.avatarMiniFrame}>
                          <Image
                            source={SPRITES[character.image] || { uri: AVATAR_PLACEHOLDER }}
                            style={styles.avatarMini}
                            resizeMode="contain"
                          />
                        </View>
                      ))}
                    </View>
                  ) : null}
                </View>

                <View style={styles.inlineButtons}>
                  <TouchableOpacity style={styles.iconButton} onPress={() => handleEdit(team)}>
                    <MaterialCommunityIcons name="pencil" size={18} color="#0a0e1a" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.iconButtonDanger} onPress={() => deleteTeam(team.id)}>
                    <MaterialCommunityIcons name="delete" size={18} color="#fff" />
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
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  headerBox: {
    marginBottom: 18,
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginTop: 10,
  },
  subtitle: {
    color: '#eff6ff',
    fontSize: 14,
    marginTop: 6,
    lineHeight: 20,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    marginBottom: 10,
  },
  selectorHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    color: '#eff6ff'
  },
  selectorLabel: {
    color: '#eff6ff',
    fontSize: 12,
    fontWeight: '700',
  },
  selectorCounter: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '800',
  },
  charactersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 8,
  },
  characterCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  characterCardSelected: {
    borderColor: '#38bdf8',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
  },
  characterAvatarFrame: {
    width: 78,
    height: 78,
    borderRadius: 39,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.18)',
    marginBottom: 6,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterImage: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignSelf: 'center',
    backgroundColor: '#ffffff',
  },
  characterName: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  characterKi: {
    color: '#e5eefb',
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  helperText: {
    color: '#eff6ff',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#f5c518',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  primaryButtonText: {
    color: '#07111f',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  secondaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  badge: {
    color: '#0a0e1a',
    backgroundColor: '#38bdf8',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    fontWeight: '800',
  },
  teamCard: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamInfo: {
    flex: 1,
    paddingRight: 8,
  },
  teamName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  teamMeta: {
    color: '#e5eefb',
    fontSize: 12,
    marginBottom: 2,
  },
  avatarRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 6,
  },
  avatarMiniFrame: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMini: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignSelf: 'center',
    backgroundColor: '#ffffff',
  },
  inlineButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    backgroundColor: '#f5c518',
    borderRadius: 10,
    padding: 8,
  },
  iconButtonDanger: {
    backgroundColor: '#e11d48',
    borderRadius: 10,
    padding: 8,
  },
  emptyText: {
    color: '#c7d2e3',
    fontSize: 13,
    marginBottom: 10,
  },
  noteCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.18)',
    padding: 10,
    alignItems: 'flex-start',
    gap: 8,
  },
  noteText: {
    flex: 1,
    color: '#dbeafe',
    fontSize: 12,
    lineHeight: 18,
  },
});
