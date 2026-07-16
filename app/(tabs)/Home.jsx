import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View, Image, SafeAreaView, ScrollView, Modal } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import TopBar from '../../src/components/TopBar';
import AsyncStorage from '@react-native-async-storage/async-storage';

  const TITLES = ['Duelo', 'Configuración Duelo']
  const menuOptions = [
    {
      title: TITLES[0],
      subtitle: 'Combate contra la CPU o contra otro jugador',
      icon: 'sword-cross',
    },
    {
      title: TITLES[1],
      subtitle: 'Crea tus plantillas de duelo',
      icon: 'earth',
    },
  ];

export default function Home(){

  const {user} = useAuth()
  const router = useRouter();
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const checkTutorialFlag = async () => {
      try {
        const shouldShow = await AsyncStorage.getItem('showTutorialAfterRegister');
        if (shouldShow === 'true') {
          setShowTutorial(true);
          await AsyncStorage.removeItem('showTutorialAfterRegister');
        }
      } catch (error) {
        console.log('error al verificar tutorial:', error);
      }
    };

    checkTutorialFlag();
  }, []);

  return (
      <View style={styles.container}>
    <StatusBar hidden />

    <SafeAreaView style={styles.safeArea}>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.topBar}>

          <View style={styles.profileSection}>
            <TopBar/>
          </View>

          

        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>Dragon Ball</Text>
          <Text style={styles.title}>Sparking Mobile</Text>
          

        </View>

        <View style={styles.menuContainer}>

          {menuOptions.map((item) => (
            <TouchableOpacity
              key={item.title}
              style={styles.menuButton}
              activeOpacity={0.85}
              onPress={() => {
                if (item.title === TITLES[1]) {
                  router.push('/(game)/CrearDuelo');
                }else if(item.title === TITLES[0]){
                  router.push('/(game)/PlayDuelo');
                }
              }}
            >

              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name={item.icon}
                  size={28}
                  color="#0a0e1a"
                />
              </View>

              <View>
                <Text style={styles.menuTitle}>
                  {item.title}
                </Text>

                <Text style={styles.menuSubtitle}>
                  {item.subtitle}
                </Text>
              </View>

            </TouchableOpacity>
          ))}
          <View style={styles.helpButtonWrapper}>
            <TouchableOpacity
              style={styles.helpButton}
              onPress={() => setShowTutorial(true)}
              accessibilityLabel="Abrir tutorial"
            >
              <Text style={styles.helpButtonText}>?</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

    </SafeAreaView>

    <Modal
      visible={showTutorial}
      transparent
      animationType="fade"
      onRequestClose={() => setShowTutorial(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowTutorial(false)}
            accessibilityLabel="Cerrar tutorial"
          >
            <MaterialCommunityIcons name="close" size={24} color="#fff" />
          </TouchableOpacity>

          <Image
            source={require('../../assets/tutorial.png')}
            style={styles.tutorialImage}
            resizeMode="contain"
          />
        </View>
      </View>
    </Modal>
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

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },

  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#38bdf8',
    marginRight: 12,
  },

  avatar: {
    width: '100%',
    height: '100%',
  },

  UserNameText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 4,
    letterSpacing: 1,
  },

  xpBar: {
    width: 90,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    overflow: 'hidden',
  },

  xpFill: {
    width: '70%',
    height: '100%',
    backgroundColor: '#38bdf8',
  },

  currencySection: {
    flexDirection: 'row',
  },

  currencyText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 12,
  },

  helpButtonWrapper: {
    alignItems: 'center',
    marginTop: 25,
  },

  helpButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#afe2ff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  helpButtonText: {
    color: '#0a0e1a',
    fontSize: 22,
    fontWeight: '900',
  },

  titleContainer: {
    marginTop: 50,
    marginBottom: 40,
  },

  title: {
    color: '#fff',
    fontSize: 40,
    fontWeight: '900',
    lineHeight: 42,
    letterSpacing: 2,
  },

  menuContainer: {
    gap: 18,
  },

  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#afe2ff',
    borderRadius: 24,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },

  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#afe2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
  },

  menuTitle: {
    color: '#0a0e1a',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
  },

  menuSubtitle: {
    color: '#444',
    fontSize: 14,
    marginTop: 4,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 14,
    alignItems: 'center',
  },

  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 8,
  },

  tutorialImage: {
    width: '100%',
    height: 480,
    borderRadius: 12,
  },

  bottomNav: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    height: 70,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 22,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

});