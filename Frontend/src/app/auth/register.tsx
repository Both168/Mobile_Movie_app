import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from '../../hooks/useRouter';
import { Colors } from '../../constants/Colors';
import RegisterForm from '../../components/authComponent/RegisterForm';
import { register } from '../../services/authService';

export default function RegisterScreen() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (
    username: string,
    password: string,
    name?: string,
    avatar?: { uri: string; type: string; name: string }
  ) => {
    setError('');
    setIsLoading(true);

    try {
      const response = await register(username, password, name, avatar);

      if (response.success && response.data) {
        Alert.alert(
          'Success',
          'Registration successful!',
          [
            {
              text: 'OK',
              onPress: () => router.replace(router.ROUTES.HOME),
            },
          ]
        );
      } else {
        let errorMessage = response.message || 'Registration failed. Please try again.';

        if (response.errors) {
          const errorKeys = Object.keys(response.errors);
          if (errorKeys.length > 0) {
            const firstError = response.errors[errorKeys[0]];
            if (firstError && firstError.length > 0) {
              errorMessage = firstError[0];
            }
          }
        }

        if (errorMessage.includes('already been taken')) {
          errorMessage = 'Username already exists. Please choose a different username.';
        } else if (errorMessage.includes('at least 3 characters')) {
          errorMessage = 'Username must be at least 3 characters.';
        } else if (errorMessage.includes('at least 6 characters')) {
          errorMessage = 'Password must be at least 6 characters.';
        }

        Alert.alert('Registration Failed', errorMessage, [{ text: 'OK' }]);
        setError('');
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Image 
            source={require('../../../assets/icon.png')} 
            style={styles.icon}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>
      </View>

      <View style={styles.formContainer}>
        <RegisterForm onRegister={handleRegister} error={error} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.linkText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  icon: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  formContainer: {
    width: '100%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  linkText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
});
