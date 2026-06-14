import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View, Image, SafeAreaView, ScrollView } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import TopBar from '../../src/components/TopBar';

export default function Home(){

  const {user} = useAuth()

  const menuOptions = [
    {
      title: 'Duelo',
      subtitle: 'Batallas contra CPU',
      icon: 'sword-cross',
    },
    {
      title: 'Configuración Duelo',
      subtitle: 'Crea tus plantillas de duelo',
      icon: 'earth',
    }
  ];

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

          {menuOptions.map((item, index) => (
            <TouchableOpacity
              key={item.title}
              style={styles.menuButton}
              activeOpacity={0.85}
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

        </View>

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