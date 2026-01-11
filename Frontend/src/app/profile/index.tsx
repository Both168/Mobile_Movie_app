import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from '../../hooks/useRouter';
import { Colors } from '../../constants/Colors';
import BottomTabBar from '../../components/BottomTabBar';
import { useState, useEffect } from 'react';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { getUserData, clearUserData } from '../../services/storageService';
import { UserData, logout } from '../../services/authService';
import { ROUTES } from '../../utils/routes';
import { MaterialIcons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [avatarError, setAvatarError] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [])
  );

  const loadUserData = async () => {
    try {
      const userData = await getUserData();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };


  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace(router.ROUTES.AUTH);
            } catch (error) {
              console.error('Logout error:', error);
              await clearUserData();
              router.replace(router.ROUTES.AUTH);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.content}>
          <View style={styles.avatarContainer}>
            {user?.avarta && user.avarta !== null && typeof user.avarta === 'string' && user.avarta.trim() !== '' && !avatarError ? (
              <Image
                source={{ uri: user.avarta }}
                style={styles.avatarImage}
                onError={() => setAvatarError(true)}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Image 
                  source={require('../../../assets/icon.png')} 
                  style={styles.avatarPlaceholderIcon}
                  resizeMode="contain"
                />
              </View>
            )}
          </View>
          {user && (
            <>
              <Text style={styles.name}>{user.name}</Text>
              <Text style={styles.username}>@{user.username}</Text>
              <View style={styles.infoContainer}>
                <TouchableOpacity 
                  style={styles.infoCard}
                  onPress={() => router.push(ROUTES.MY_LIST as any)}
                  activeOpacity={0.7}
                >
                  <View style={styles.myListCardContent}>
                    <Text style={styles.infoLabel}>My List</Text>
                    <MaterialIcons name="chevron-right" size={24} color={Colors.textSecondary} />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.infoCard}
                  onPress={() => router.push(ROUTES.SETTINGS as any)}
                  activeOpacity={0.7}
                >
                  <View style={styles.myListCardContent}>
                    <Text style={styles.infoLabel}>Settings</Text>
                    <MaterialIcons name="chevron-right" size={24} color={Colors.textSecondary} />
                  </View>
                </TouchableOpacity>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Member Status</Text>
                  <Text style={[styles.infoValue, styles.statusBadge, user.is_member === 1 && styles.memberActive]}>
                    {user.is_member === 1 ? 'Member' : 'Not a Member'}
                  </Text>
                </View>
                {user.is_admin === 1 && (
                  <View style={styles.infoCard}>
                    <Text style={styles.infoLabel}>Role</Text>
                    <Text style={[styles.infoValue, styles.adminBadge]}>Administrator</Text>
                  </View>
                )}
              </View>
              
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
      <BottomTabBar activeTab={activeTab} onTabPress={setActiveTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: '#1a1a1a',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingTop: 24,
    paddingBottom: 40,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  myListCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarContainer: {
    marginBottom: 24,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholderIcon: {
    width: 60,
    height: 60,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  username: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 32,
  },
  infoContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 32,
  },
  infoCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 22,
    padding: 16,
    width: '100%',
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 18,
    color: Colors.text,
    fontWeight: '600',
  },
  statusBadge: {
    fontSize: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#3a3a3a',
    color: Colors.textSecondary,
    alignSelf: 'flex-start',
  },
  memberActive: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
  },
  adminBadge: {
    fontSize: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#E3F2FD',
    color: '#1976D2',
    alignSelf: 'flex-start',
  },
  logoutButton: {
    width: '100%',
    height: 50,
    backgroundColor: Colors.error,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 5, height: 5 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
