import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useRouter } from '../../hooks/useRouter';
import { changePassword } from '../../services/authService';
import BottomTabBar from '../../components/BottomTabBar';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!oldPassword.trim()) {
      newErrors.oldPassword = 'Old password is required';
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'New password must be at least 6 characters';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (oldPassword === newPassword) {
      newErrors.newPassword = 'New password must be different from old password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await changePassword(oldPassword, newPassword);

      if (response.success) {
        Alert.alert(
          'Success',
          response.message || 'Password updated successfully',
          [
            {
              text: 'OK',
              onPress: () => {
                router.back();
              },
            },
          ]
        );
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        // Handle API errors
        if (response.errors) {
          const apiErrors: { [key: string]: string } = {};
          Object.keys(response.errors).forEach((key) => {
            if (response.errors && response.errors[key] && response.errors[key].length > 0) {
              if (key === 'old_password') {
                apiErrors.oldPassword = response.errors[key][0];
              } else if (key === 'new_password') {
                apiErrors.newPassword = response.errors[key][0];
              }
            }
          });
          setErrors(apiErrors);
        } else {
          Alert.alert('Error', response.message || 'Failed to change password. Please try again.');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.error('Change password error:', error);
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
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Old Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your current password"
                placeholderTextColor={Colors.textSecondary}
                value={oldPassword}
                onChangeText={(text) => {
                  setOldPassword(text);
                  if (errors.oldPassword) {
                    setErrors({ ...errors, oldPassword: '' });
                  }
                }}
                secureTextEntry={!showOldPassword}
                autoCapitalize="none"
                autoComplete="password"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowOldPassword(!showOldPassword)}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name={showOldPassword ? 'visibility' : 'visibility-off'}
                  size={24}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            {errors.oldPassword && (
              <Text style={styles.errorText}>{errors.oldPassword}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your new password (min 6 characters)"
                placeholderTextColor={Colors.textSecondary}
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  if (errors.newPassword) {
                    setErrors({ ...errors, newPassword: '' });
                  }
                }}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
                autoComplete="password-new"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowNewPassword(!showNewPassword)}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name={showNewPassword ? 'visibility' : 'visibility-off'}
                  size={24}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            {errors.newPassword && (
              <Text style={styles.errorText}>{errors.newPassword}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm your new password"
                placeholderTextColor={Colors.textSecondary}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword) {
                    setErrors({ ...errors, confirmPassword: '' });
                  }
                }}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoComplete="password-new"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                  size={24}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleChangePassword}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Updating...' : 'Change Password'}
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.text,
  },
  eyeIcon: {
    paddingRight: 16,
    paddingLeft: 8,
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
});
