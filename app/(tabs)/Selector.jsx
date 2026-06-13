import React, { useEffect, useState } from 'react';
import {
  Image,
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

const STORAGE_KEY = 'sparking_teams';

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
    const { user } = useAuth();
    const [teams, setTeams] = useState([]);
    const [teamName, setTeamName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedCharacterIds, setSelectedCharacterIds] = useState([]);

    const personaje1 = {"id":11,"name":"Krillin","ki":"1.000.000","maxKi":"1 Billion","race":"Human","gender":"Male","description":"Amigo cercano de Goku y guerrero valiente, es un personaje del manga y anime de Dragon Ball. Es uno de los principales discípulos de Kame-Sen'nin, Guerrero Z, y el mejor amigo de Son Goku. Es junto a Bulma uno de los personajes de apoyo principales de Dragon Ball, Dragon Ball Z y Dragon Ball Super. Aparece en Dragon Ball GT como personaje secundario. En el Arco de Majin Boo, se retira de las artes marciales, optando por formar una familia, como el esposo de la Androide Número 18 y el padre de Marron.","image":"https://dragonball-api.com/characters/Krilin_Universo7.webp","affiliation":"Z Fighter","deletedAt":null,"originPlanet":{"id":2,"name":"Tierra","isDestroyed":false,"description":"La Tierra también llamado Mundo del Dragón (Dragon World), es el planeta principal donde se desarrolla la serie de Dragon Ball. Se encuentra en el Sistema Solar de la Vía Láctea de las Galaxias del Norte del Universo 7, lugar que supervisa el Kaio del Norte, y tiene su equivalente en el Universo 6. El hogar de los terrícolas y los Guerreros Z. Ha sido atacado en varias ocasiones por enemigos poderosos.","image":"https://dragonball-api.com/planetas/Tierra_Dragon_Ball_Z.webp","deletedAt":null},"transformations":[]}        
    const personaje2 = {"id":6,"name":"Zarbon","ki":"20.000","maxKi":"30.000","race":"Frieza Race","gender":"Male","description":"Zarbon es uno de los secuaces de Freezer y un luchador poderoso.","image":"https://dragonball-api.com/characters/zarbon.webp","affiliation":"Army of Frieza","deletedAt":null,"originPlanet":{"id":4,"name":"Freezer No. 79","isDestroyed":true,"description":"Planeta artificial utilizado por Freezer como base de operaciones y centro de clonación.","image":"https://dragonball-api.com/planetas/PlanetaFreezer.webp","deletedAt":null},"transformations":[{"id":18,"name":"Zarbon Monster","image":"https://dragonball-api.com/transformaciones/zarbon monster.webp","ki":"30.000","deletedAt":null}]}
    const personaje3 ={"id":2,"name":"Vegeta","ki":"54.000.000","maxKi":"19.84 Septillion","race":"Saiyan","gender":"Male","description":"Príncipe de los Saiyans, inicialmente un villano, pero luego se une a los Z Fighters. A pesar de que a inicios de Dragon Ball Z, Vegeta cumple un papel antagónico, poco después decide rebelarse ante el Imperio de Freeza, volviéndose un aliado clave para los Guerreros Z. Con el paso del tiempo llegaría a cambiar su manera de ser, optando por permanecer y vivir en la Tierra para luchar a su lado contra las inminentes adversidades que superar. Junto con Piccolo, él es de los antiguos enemigos de Goku que ha evolucionando al pasar de ser un villano y antihéroe, a finalmente un héroe a lo largo del transcurso de la historia, convirtiéndose así en el deuteragonista de la serie.","image":"https://dragonball-api.com/characters/vegeta_normal.webp","affiliation":"Z Fighter","deletedAt":null,"originPlanet":{"id":3,"name":"Vegeta","isDestroyed":true,"description":"El planeta Vegeta, conocido como planeta Plant antes del fin de la Guerra Saiyan-tsufruiana en el año 730, es un planeta rocoso ficticio de la serie de manga y anime Dragon Ball y localizado en la Vía Láctea de las Galaxias del Norte del Universo 7 hasta su destrucción a manos de Freezer en los años 737-739. Planeta natal de los Saiyans, destruido por Freezer. Anteriormente conocido como Planeta Plant.","image":"https://dragonball-api.com/planetas/Planeta_Vegeta_en_Dragon_Ball_Super_Broly.webp","deletedAt":null},"transformations":[{"id":7,"name":"Vegeta SSJ","image":"https://dragonball-api.com/transformaciones/vegeta SSJ (2).webp","ki":"330.000.000","deletedAt":null},{"id":8,"name":"Vegeta SSJ2","image":"https://dragonball-api.com/transformaciones/vegeta SSJ2.webp","ki":"24 Billion","deletedAt":null},{"id":9,"name":"Vegeta SSJ4","image":"https://dragonball-api.com/transformaciones/vegeta ssj4.webp","ki":"1.8 Trillion","deletedAt":null},{"id":10,"name":"Vegeta SSJB","image":"https://dragonball-api.com/transformaciones/vegeta SSJB.webp","ki":"100 Quintillion","deletedAt":null},{"id":11,"name":"Vegeta Mega Instinc Evil","image":"https://dragonball-api.com/transformaciones/vegeta mega instinto.webp","ki":"19.84 Septillion","deletedAt":null}]}
    const personaje4 ={"id":16,"name":"Trunks","ki":"50.000.000","maxKi":"37.4 septllion","race":"Saiyan","gender":"Male","description":"Hijo de Vegeta y Bulma. Es un mestizo entre humano terrícola y Saiyano nacido en la Tierra, e hijo de Bulma y Vegeta, el cual es introducido en el Arco de los Androides y Cell. Más tarde en su vida como joven, se termina convirtiendo en un luchador de artes marciales, el mejor amigo de Son Goten y en el hermano mayor de su hermana Bra.","image":"https://dragonball-api.com/characters/Trunks_Buu_Artwork.webp","affiliation":"Z Fighter","deletedAt":null,"originPlanet":{"id":2,"name":"Tierra","isDestroyed":false,"description":"La Tierra también llamado Mundo del Dragón (Dragon World), es el planeta principal donde se desarrolla la serie de Dragon Ball. Se encuentra en el Sistema Solar de la Vía Láctea de las Galaxias del Norte del Universo 7, lugar que supervisa el Kaio del Norte, y tiene su equivalente en el Universo 6. El hogar de los terrícolas y los Guerreros Z. Ha sido atacado en varias ocasiones por enemigos poderosos.","image":"https://dragonball-api.com/planetas/Tierra_Dragon_Ball_Z.webp","deletedAt":null},"transformations":[{"id":26,"name":"Trunks SSJ","image":"https://dragonball-api.com/transformaciones/trunks_ssj-removebg-preview.webp","ki":"905.000.000","deletedAt":null},{"id":27,"name":"Trunks SSJ2","image":"https://dragonball-api.com/transformaciones/trunks ssj2.webp","ki":"18.000.000.000","deletedAt":null},{"id":28,"name":"Trunks SSJ3","image":"https://dragonball-api.com/transformaciones/trunks ssj3.webp","ki":"1.25 Billion","deletedAt":null},{"id":29,"name":"Trunks Rage","image":"https://dragonball-api.com/transformaciones/trunks ssj iracundo.webp","ki":"17.5 Quintillion ","deletedAt":null}]}
    const personaje5 ={"id":22,"name":"Android 17","ki":"320.000.000","maxKi":"40 Quintillion","race":"Android","gender":"Male","description":"Antes de ser secuestrado, es el hermano mellizo de la Androide Número 18, quien al igual que ella antes de ser Androide era un humano normal hasta que fueron secuestrados por el Dr. Gero, y es por eso que lo odian. Tras su cambio de humano a Androide, le insertaron un chip con el objetivo de destruir a Son Goku, quien en su juventud extermino al Ejército del Listón Rojo. Al considerarse defectuoso porque no quería ser 'esclavo de nadie', el Dr. Gero les había colocado a ambos hermanos, un dispositivo de apagado para detenerlos en cualquier momento de desobediencia, pero cuando el científico los despierta, el rencor y rebeldía de 17 eran tal que se encargó de destruir el control que lo volvería a encerrar y acto seguido mató sin piedad a su propio creador. Su situación se le iría en contra, ya que Cell tenía como misión absorber a 17 y 18 para completar su desarrollo y convertirse en Cell Perfecto.","image":"https://dragonball-api.com/characters/17_Artwork.webp","affiliation":"Villain","deletedAt":null,"originPlanet":{"id":2,"name":"Tierra","isDestroyed":false,"description":"La Tierra también llamado Mundo del Dragón (Dragon World), es el planeta principal donde se desarrolla la serie de Dragon Ball. Se encuentra en el Sistema Solar de la Vía Láctea de las Galaxias del Norte del Universo 7, lugar que supervisa el Kaio del Norte, y tiene su equivalente en el Universo 6. El hogar de los terrícolas y los Guerreros Z. Ha sido atacado en varias ocasiones por enemigos poderosos.","image":"https://dragonball-api.com/planetas/Tierra_Dragon_Ball_Z.webp","deletedAt":null},"transformations":[]}
    const personaje6 ={"id":33,"name":"Bills","ki":"102 Billion","maxKi":"100 septillion","race":"God","gender":"Male","description":"Dios de la Destrucción Beerus, conocido también como Beers, o Bills en Hispanoamérica e inicialmente en España[1], es un personaje que fue introducido en la película Dragon Ball Z: La batalla de los dioses, donde es el antagonista principal de la película, y que aparece en el manga y anime de Dragon Ball Super como un personaje principal. Ocupa el puesto de Dios de la Destrucción de todo el Universo 7 siendo el lugar donde se desarrolla la historia de Dragon Ball.","image":"https://dragonball-api.com/characters/Beerus_DBS_Broly_Artwork.webp","affiliation":"Other","deletedAt":null,"originPlanet":{"id":19,"name":"Planeta de Bills ","isDestroyed":false,"description":"Planeta de Bills un cuerpo celeste ubicado dentro del mundo de los vivos del Universo 7, el cual aparece por primera vez en la película Dragon Ball Z: La Batalla de los Dioses.","image":"https://dragonball-api.com/planetas/Templo_de_Bills2.webp","deletedAt":null},"transformations":[]}

    characters = [personaje1, personaje2, personaje3, personaje4, personaje5, personaje6];
    const availableCharacters = Array.isArray(characters) && characters.length > 0
      ? characters
      : [personaje];

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

        const nuevoEquipo = {
        id: Date.now().toString(),
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

            <View style={styles.charactersGrid}>
              {availableCharacters.map((character) => {
                const selected = selectedCharacterIds.includes(character.id);

                return (
                  <TouchableOpacity
                    key={character.id}
                    style={[styles.characterCard, selected && styles.characterCardSelected]}
                    onPress={() => toggleCharacter(character)}
                    activeOpacity={0.9}
                  >
                    <View style={styles.characterAvatarFrame}>
                      <Image
                        source={{ uri: character.image }}
                        style={styles.characterImage}
                        resizeMode="contain"
                      />
                    </View>
                    <Text style={styles.characterName}>{character.name}</Text>
                    <Text style={styles.characterKi}>{character.ki || 'Personaje'}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>


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
                            source={{ uri: character.image }}
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
