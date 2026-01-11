import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/Colors';
import { useRouter } from '../../hooks/useRouter';
import { updateProfile } from '../../services/authService';
import { getUserData } from '../../services/storageService';
import { UserData } from '../../services/authService';
import BottomTabBar from '../../components/BottomTabBar';

export default function EditProfileScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState<UserData | null>(null);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState<{ uri: string; type: string; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await getUserData();
      if (userData) {
        setUser(userData);
        setName(userData.name || '');
        setUsername(userData.username || '');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to upload an avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const uri = asset.uri;
      const fileName = uri.split('/').pop() || 'avatar.jpg';
      const match = /\.(\w+)$/.exec(fileName);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      // Check file size (max 2MB)
      if (asset.fileSize && asset.fileSize > 2 * 1024 * 1024) {
        Alert.alert('Error', 'Image size must be less than 2MB');
        return;
      }

      setAvatar({
        uri,
        type,
        name: fileName,
      });
      setAvatarError(false);
      if (errors.avarta) {
        setErrors({ ...errors, avarta: '' });
      }
    }
  };

  const removeAvatar = () => {
    setAvatar(null);
    setAvatarError(false);
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (username.trim() && username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (username.trim() && username.length > 50) {
      newErrors.username = 'Username must not exceed 50 characters';
    }

    if (name.trim() && name.length > 255) {
      newErrors.name = 'Name must not exceed 255 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProfile = async () => {
    if (!validateForm()) {
      return;
    }

    // Check if anything has changed
    const nameChanged = name.trim() !== (user?.name || '');
    const usernameChanged = username.trim() !== (user?.username || '');
    const avatarChanged = avatar !== null;

    if (!nameChanged && !usernameChanged && !avatarChanged) {
      Alert.alert('No Changes', 'No changes were made to your profile.');
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await updateProfile(
        name.trim() || undefined,
        username.trim() || undefined,
        avatar || undefined
      );

      if (response.success) {
        Alert.alert(
          'Success',
          response.message || 'Profile updated successfully',
          [
            {
              text: 'OK',
              onPress: () => {
                router.back();
              },
            },
          ]
        );
      } else {
        // Handle API errors
        if (response.errors) {
          const apiErrors: { [key: string]: string } = {};
          Object.keys(response.errors).forEach((key) => {
            if (response.errors && response.errors[key] && response.errors[key].length > 0) {
              apiErrors[key] = response.errors[key][0];
            }
          });
          setErrors(apiErrors);
        } else {
          Alert.alert('Error', response.message || 'Failed to update profile. Please try again.');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.error('Update profile error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Avatar (Optional)</Text>
            <View style={styles.avatarContainer}>
              {avatar ? (
                <View style={styles.avatarPreviewContainer}>
                  <Image source={{ uri: avatar.uri }} style={styles.avatarPreview} />
                  <TouchableOpacity
                    style={styles.removeAvatarButton}
                    onPress={removeAvatar}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="close" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ) : user?.avarta && user.avarta !== null && typeof user.avarta === 'string' && user.avarta.trim() !== '' && !avatarError ? (
                <View style={styles.avatarPreviewContainer}>
                  <Image
                    source={{ uri: user.avarta }}
                    style={styles.avatarPreview}
                    onError={() => setAvatarError(true)}
                  />
                  <TouchableOpacity
                    style={styles.changeAvatarButton}
                    onPress={pickImage}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="edit" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.avatarPlaceholder}
                  onPress={pickImage}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="add-a-photo" size={32} color={Colors.textSecondary} />
                  <Text style={styles.avatarPlaceholderText}>Tap to add avatar</Text>
                </TouchableOpacity>
              )}
            </View>
            {errors.avarta && (
              <Text style={styles.errorText}>{errors.avarta}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name (Optional)</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="Enter your name"
              placeholderTextColor={Colors.textSecondary}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) {
                  setErrors({ ...errors, name: '' });
                }
              }}
              autoCapitalize="words"
              maxLength={255}
            />
            {errors.name && (
              <Text style={styles.errorText}>{errors.name}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username (Optional)</Text>
            <TextInput
              style={[styles.input, errors.username && styles.inputError]}
              placeholder="Enter username (min 3, max 50 characters)"
              placeholderTextColor={Colors.textSecondary}
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                if (errors.username) {
                  setErrors({ ...errors, username: '' });
                }
              }}
              autoCapitalize="none"
              autoComplete="username"
              maxLength={50}
            />
            {errors.username && (
              <Text style={styles.errorText}>{errors.username}</Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleUpdateProfile}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Updating...' : 'Update Profile'}
            </Text>
          </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
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
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginRight: 40,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: '#2a2a2a',
    borderRadius: 22,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  inputError: {
    borderWidth: 1,
    borderColor: Colors.error,
  },
  button: {
    height: 50,
    backgroundColor: Colors.primary,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  avatarPreviewContainer: {
    position: 'relative',
  },
  avatarPreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  removeAvatarButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1a1a1a',
  },
  changeAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1a1a1a',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: Colors.textSecondary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
  },
  avatarPlaceholderText: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
