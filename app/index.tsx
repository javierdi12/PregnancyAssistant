import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme
} from 'react-native';
import { auth } from '../FireBase';
import { useGoogleAuth } from '../services/googleAuth';
import { getLoginStyles } from '../styles/login';
import { getFirebaseErrorMessage, isValidEmail } from '../utils/firebaseError';

// Definir tipos para los intervalos
type IntervalHandle = ReturnType<typeof setInterval>;
type TimeoutHandle = ReturnType<typeof setTimeout>;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeAuth, setActiveAuth] = useState<'none' | 'email' | 'google' | 'facebook'>('none');
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const isMountedRef = useRef(true);
  const popupRef = useRef<Window | null>(null);
  const intervalRef = useRef<IntervalHandle | null>(null);
  const timeoutRef = useRef<TimeoutHandle | null>(null);

  // Function to verify if the user accepted terms
  const checkTermsAccepted = async (): Promise<boolean> => {
    try {
      const termsAccepted = await AsyncStorage.getItem('terms_accepted');
      return termsAccepted === 'true';
    } catch (error) {
      console.error('Error checking terms:', error);
      return false;
    }
  };

  // Effect that handles redirection based on login and acceptance of terms
  useEffect(() => {
    isMountedRef.current = true;

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log('Estado de autenticación cambiado:', user ? 'Usuario autenticado' : 'No autenticado');
      
      if (user && isMountedRef.current) {
        try {
          // Verificar el método de autenticación
          const isPasswordAuth = user.providerData.some(p => p.providerId === 'password');
          const isGoogleAuth = user.providerData.some(p => p.providerId === 'google.com');
          
          console.log('Método de autenticación:', 
            isPasswordAuth ? 'Email/Password' : 
            isGoogleAuth ? 'Google' : 
            'Otro método');

          // Solo verificar email para autenticación con password
          if (isPasswordAuth && !user.emailVerified) {
            Alert.alert(
              'Verifica tu correo',
              'Te enviamos un email de verificación. Debes confirmarlo para continuar.'
            );
            await signOut(auth);
            return;
          }

          // Verificar términos aceptados para cualquier tipo de autenticación
          const termsAccepted = await checkTermsAccepted();
          console.log('Términos aceptados:', termsAccepted);

          // Agregamos un pequeño delay para asegurar que la navegación se ejecute después de que Firebase esté listo
          await new Promise(resolve => setTimeout(resolve, 100));

          if (termsAccepted) {
            console.log('Redirigiendo a tabs...');
            await router.replace('/(tabs)');
          } else {
            console.log('Redirigiendo a privacy...');
            await router.replace('/privacy');
          }
        } catch (error) {
          console.error('Error en manejo de autenticación:', error);
          Alert.alert('Error', 'Hubo un problema al procesar tu inicio de sesión');
        }
      }
    });

    return () => {
      isMountedRef.current = false;
      unsubscribe();
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close();
      }
    };
  }, []);


  // Función segura para establecer estado
  const safeSetIsLoading = (value: boolean) => {
    if (isMountedRef.current) {
      setIsLoading(value);
    }
  };

  const signIn = async () => {
    safeSetIsLoading(true);
    if (!email || !password) {
      Alert.alert('Campos requeridos', 'Por favor, ingresa tu correo y contraseña.');
      return;
    }
    if (!isValidEmail(email)) {
      Alert.alert('Email inválido', 'Por favor, ingresa un correo electrónico válido.');
      return;
    }
    try {
      const user = await signInWithEmailAndPassword(auth, email, password);

      // if email is not verified yet
      if (!user.user.emailVerified) {
        // resend verification email
        await sendEmailVerification(user.user);
        Alert.alert(
          'Verificación requerida',
          'Tu correo aún no está verificado. Te reenviamos el email de verificación.'
        );
        await signOut(auth);
        return; // no redirection until email is verified
      }

      if (user && isMountedRef.current) {
        const termsAccepted = await checkTermsAccepted();
        if (termsAccepted) {
          router.replace('/(tabs)');
        } else {
          router.replace('/privacy');
        }
      }
    } catch (error) {
      const errorMsg = getFirebaseErrorMessage(error);
      Alert.alert('Error', errorMsg);
    } finally {
      safeSetIsLoading(false);
    }
  };

  const signUp = async () => {
    safeSetIsLoading(true);
    if (!email || !password) {
      Alert.alert('Campos requeridos', 'Por favor, ingresa tu correo y contraseña.');
      return;
    }
    if (!isValidEmail(email)) {
      Alert.alert('Email inválido', 'Por favor, ingresa un correo electrónico válido.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // send email verification
      await sendEmailVerification(userCredential.user);
      Alert.alert(
        'Verifica tu correo',
        'Te enviamos un email de verificación. Ábrelo y toca el enlace para activar tu cuenta.'
      );

      // close session until email is verified
      await signOut(auth);

      // no redirection until email is verified
    } catch (error) {
      const errorMsg = getFirebaseErrorMessage(error);
      Alert.alert('Error', errorMsg);
    } finally {
      safeSetIsLoading(false);
    }
  };


  const resetPassword = async () => {
    if (!email) {
      Alert.alert("Campo requerido", "Por favor, ingresa tu correo para restablecer la contraseña.");
      return;
    }
    try {
      setIsLoading(true);
      await sendPasswordResetEmail(auth, email);
      Alert.alert("Correo enviado", "Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.");
    } catch (error: any) {
      const errorMsg = getFirebaseErrorMessage(error);
      Alert.alert('Error', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const { handleGoogleSignIn, isLoading: isGoogleLoading } = useGoogleAuth();

  const handleGooglePress = async () => {
    try {
      safeSetIsLoading(true);
      await handleGoogleSignIn();
      // No redirijas aquí; el effect lo hace
    } catch (e) {
      console.error('Error en login con Google:', e);
      Alert.alert('Error', 'No se pudo iniciar sesión con Google');
    } finally {
      safeSetIsLoading(false);
    }
  };

  const continueWithoutAccount = () => {
    if (isMountedRef.current) {
      router.replace('/privacy');
    }
  };

  const cancelEmailAuth = () => {
    if (isMountedRef.current) {
      setActiveAuth('none');
    }
  };

  const styles = getLoginStyles(isDarkMode);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={isMountedRef.current ? (isDarkMode ? '#BB86FC' : '#5C6BC0') : '#CCC'} />
        <Text style={styles.loadingText}>Cargando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('../assets/images/index.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Bienvenida{'\n'}Pregnancy Assistant</Text>

      {activeAuth !== 'email' ? (
        <>
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => isMountedRef.current && setActiveAuth('email')}
            >
              <Text style={styles.optionText}>Ingresa con correo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleGooglePress}
              disabled={isGoogleLoading}
            >
              <Text style={styles.optionText}>Ingresa con Google</Text>
            </TouchableOpacity>

            
          </View>

          <Text style={styles.divider}>o</Text>

          <TouchableOpacity onPress={continueWithoutAccount}>
            <Text style={styles.continueWithoutAccount}>Continuar sin una cuenta</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.emailAuthContainer}>
          <Text style={styles.emailAuthTitle}>Ingresa con tu correo</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={isDarkMode ? '#888' : '#999'}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor={isDarkMode ? '#888' : '#999'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <View style={styles.authButtonsContainer}>
            <TouchableOpacity style={styles.authButton} onPress={signIn}>
              <Text style={styles.authButtonText}>Iniciar sesión</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.authButton} onPress={signUp}>
              <Text style={styles.authButtonText}>Crear cuenta</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={resetPassword}>
              <Text style={styles.optionText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={cancelEmailAuth}>
              <Text style={styles.cancelText}>Volver atrás</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}