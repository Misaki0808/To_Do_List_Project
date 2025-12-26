import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { DrawerContentScrollView, DrawerItemList, DrawerContentComponentProps } from '@react-navigation/drawer';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';

export default function CustomDrawer(props: DrawerContentComponentProps) {
  const { username, gender } = useApp();

  // Gender'a göre icon seç
  const getAvatarContent = () => {
    if (gender === 'female') {
      return '👩‍💼'; // Kadın profil
    }
    return '👨‍💼'; // Erkek profil (default)
  };

  return (
    <View style={styles.container}>
      {/* Üst Profil Bölümü */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <LinearGradient
            colors={['#f093fb', '#f5576c']}
            style={styles.avatar}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.avatarIcon}>
              {getAvatarContent()}
            </Text>
          </LinearGradient>
        </View>

        {/* İsim */}
        <Text style={styles.userName}>{username || 'Kullanıcı'}</Text>
        <Text style={styles.userSubtitle}>DailyPlanner</Text>
      </LinearGradient>

      {/* Navigation Menüsü */}
      <DrawerContentScrollView {...props} style={styles.menuContainer}>
        <View style={styles.menuItems}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      {/* Alt Kısım - Versiyon */}
      <View style={styles.footer}>
        <Text style={styles.version}>v1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    padding: 30,
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
  },
  avatarIcon: {
    fontSize: 48,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  userSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  menuContainer: {
    flex: 1,
    paddingTop: 20,
  },
  menuItems: {
    paddingHorizontal: 10,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  version: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
  },
});
