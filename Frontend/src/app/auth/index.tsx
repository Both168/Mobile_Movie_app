import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from '../../hooks/useRouter';
import { Colors } from '../../constants/Colors';
import LoginForm from '../../components/authComponent/LoginForm';
import { login } from '../../services/authService';

export default function AuthScreen() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (username: string, password: string) => {
    setError('');
    setIsLoading(true);

    try {
      const response = await login(username, password);

      if (response.success && response.data) {
        router.replace(router.ROUTES.HOME);
      } else {
        let errorMessage = response.message || 'Invalid username or password. Please try again.';
        
        if (errorMessage.includes('GET method') || errorMessage.includes('POST') || errorMessage.includes('OPTIONS')) {
          errorMessage = 'Invalid username or password. Please try again.';
        } else if (errorMessage.includes('not found') || errorMessage.toLowerCase().includes('username')) {
          errorMessage = 'Username not found. Please check your username and try again.';
        } else if (errorMessage.includes('Invalid password') || errorMessage.toLowerCase().includes('password')) {
          errorMessage = 'Invalid password. Please check your password and try again.';
        }
        
        Alert.alert(
          'Login Failed',
          errorMessage,
          [{ text: 'OK' }]
        );
        setError('');
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
      console.error('Login error:', error);
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
      <StatusBar style="light" />
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Image 
            source={require('../../../assets/icon.png')} 
            style={styles.icon}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
      </View>

      <View style={styles.formContainer}>
        <LoginForm onLogin={handleLogin} error={error} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/auth/register')}>
          <Text style={styles.linkText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
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
