import React from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { TouchableOpacity } from 'react-native'



export default function TopBar() {

    const { logout, error, user } = useAuth()
    
  return (
    <View style={styles.container}>

        <View style={styles.topBar}>

          <View style={styles.profileSection}>

            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: user?.profile_pic ?? 'https://static.vecteezy.com/system/resources/thumbnails/053/406/424/small/person-gray-photo-placeholder-man-on-gray-background-avatar-man-icon-anonymous-user-male-no-photo-web-template-default-user-picture-for-social-networks-social-media-resume-forums-free-vector.jpg'
                }}
                style={styles.avatar}
              />
            </View> 

            <View>
              <Text style={styles.UserNameText}>{user?.username}</Text>
            </View>

          </View>

        </View>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0e1a',
        justifyContent: 'center',
        alignItems: 'center',
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
    }
})
