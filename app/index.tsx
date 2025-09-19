import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage to store data locally
import { router } from 'expo-router';
import {
  FacebookAuthProvider,
  createUserWithEmailAndPassword,
  signInWithCredential,
  signInWithEmailAndPassword
} from 'firebase/auth';
import React, { useEffect, useRef, useState } from 'react'; // Import React and necessary hooks
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme
} from 'react-native';
import { auth } from '../FireBase'; // Import Firebase authentication instance

const FACEBOOK_APP_ID = '1892374498008258'; // Facebook app ID

// Definir tipos para los intervalos
type IntervalHandle = ReturnType<typeof setInterval>;
type TimeoutHandle = ReturnType<typeof setTimeout>;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeAuth, setActiveAuth] = useState<'none' | 'email' | 'google' | 'facebook'>('none'); // Status for active authentication type
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

    const unsubscribe = auth.onAuthStateChanged(async (user) => {  // Listens for changes in authentication status
      if (user && isMountedRef.current) {
        const termsAccepted = await checkTermsAccepted();
        
        if (termsAccepted) {
          router.replace('/(tabs)'); 
        } else {
          router.replace('/privacy'); 
        }
      }
    });

    return () => {
      isMountedRef.current = false;
      unsubscribe();
      
      // Clear intervals and timeouts
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

  const signIn = async () => { // Function to log in with email and password
    safeSetIsLoading(true);
    try {
      const user = await signInWithEmailAndPassword(auth, email, password);
      if (user && isMountedRef.current) {
        const termsAccepted = await checkTermsAccepted();
        if (termsAccepted) {
          router.replace('/(tabs)');
        } else {
          router.replace('/privacy');
        }
      }
    } catch (err) {
      const errorMsg = err && typeof err === 'object' && 'message' in err ? err.message : String(err);
      Alert.alert('Error', 'Error al iniciar sesión: ' + errorMsg);
    } finally {
      safeSetIsLoading(false);
    }
  };

  const signUp = async () => { // Function to create account with email and password
    safeSetIsLoading(true);
    try {
      const user = await createUserWithEmailAndPassword(auth, email, password);
      if (user && isMountedRef.current) {
        const termsAccepted = await checkTermsAccepted();
        if (termsAccepted) {
          router.replace('/(tabs)');
        } else {
          router.replace('/privacy');
        }
      }
    } catch (err) {
      const errorMsg = err && typeof err === 'object' && 'message' in err ? err.message : String(err);
      Alert.alert('Error', 'Error al crear cuenta: ' + errorMsg);
    } finally {
      safeSetIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    Alert.alert('Google Sign-In', 'Esta funcionalidad requiere configuración adicional');
  };

  const handleFacebookSignIn = async () => {
    safeSetIsLoading(true);
    try {
      if (Platform.OS === 'web') {
        await handleFacebookWebLogin();
      } else {
        Alert.alert(
          // Mobile login via redirection
          'Login con Facebook',
          'Para iOS y Android, necesitamos redirigirte al navegador para completar el login. ¿Quieres continuar?',
          [
            {
              text: 'Cancelar',
              style: 'cancel',
              onPress: () => safeSetIsLoading(false)
            },
            {
              text: 'Continuar',
              onPress: () => handleFacebookMobileRedirect()
            }
          ]
        );
      }
    } catch (error: any) {
      console.error('Error en login Facebook:', error);
      Alert.alert('Error', 'No se pudo iniciar sesión con Facebook');
      safeSetIsLoading(false);
    }
  };

  const handleFacebookMobileRedirect = () => {  // Function to redirect to Facebook OAuth on mobile
    const redirectUri = `https://${window.location.hostname || 'localhost'}`;
    const authUrl = `https://www.facebook.com/v17.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=public_profile,email`;
    window.location.href = authUrl;
  };

  const handleFacebookWebLogin = async () => {  // Function to log in with Facebook on the web using a popup
    const redirectUri = window.location.origin;
    const authUrl = `https://www.facebook.com/v17.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=public_profile,email&display=popup`;
    
    const width = 600;
    const height = 600;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    
    const popup = window.open(
      authUrl,
      'Facebook Login',
      `width=${width},height=${height},top=${top},left=${left}`
    );
    
    if (!popup) {
      Alert.alert('Error', 'Por favor permite ventanas emergentes para este sitio');
      safeSetIsLoading(false);
      return;
    }
    
    popupRef.current = popup;
    let popupClosed = false;
    
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    intervalRef.current = setInterval(() => {  // Interval to check if popup closed or has token
      try {
        if (!isMountedRef.current) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return;
        }
        
        if (popup.closed) {
          popupClosed = true;
          if (intervalRef.current) clearInterval(intervalRef.current);
          safeSetIsLoading(false);
          return;
        }
        
        if (popup.location.href.startsWith(redirectUri)) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          const url = popup.location.href;
          
          const hashParams = new URLSearchParams(url.split('#')[1]);
          const accessToken = hashParams.get('access_token');
          const facebookError = hashParams.get('error');
          const errorReason = hashParams.get('error_reason');
          
          if (accessToken) {
            handleFacebookToken(accessToken);
          } else if (facebookError) {
            const errorDescription = hashParams.get('error_description') || 'Error desconocido';
            
            if (errorDescription.includes('Invalid Scopes') || errorReason === 'user_denied') {
              Alert.alert(
                'Permisos insuficientes', 
                'Para usar el inicio de sesión con Facebook, necesitamos acceso a tu dirección de email. Por favor, acepta todos los permisos solicitados.'
              );
            } else {
              Alert.alert('Error de Facebook', errorDescription);
            }
            safeSetIsLoading(false);
          }
          
          popup.close();
        }
      } catch (intervalError) {
        console.error('Interval error:', intervalError);
      }
    }, 100) as unknown as IntervalHandle;
    
    timeoutRef.current = setTimeout(() => {  // Timeout to close popup if too much time passes
      if (!popupClosed && isMountedRef.current) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (popup && !popup.closed) {
          popup.close();
        }
        Alert.alert('Error', 'Tiempo de espera agotado');
        safeSetIsLoading(false);
      }
    }, 120000) as unknown as TimeoutHandle;
  };

  const fetchFacebookUserInfo = async (accessToken: string) => {   // Function to obtain Facebook user information
    try {
      const response = await fetch(
        `https://graph.facebook.com/v17.0/me?fields=id,name,email&access_token=${accessToken}`
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching Facebook user info:', error);
      return {};
    }
  };

  const handleFacebookToken = async (token: string) => { // Function to manage Facebook token and authentication with Firebase
    try {
      const userInfo = await fetchFacebookUserInfo(token);
      
      if (!userInfo.email) {
        Alert.alert('Error', 'No se pudo obtener el email de Facebook. Por favor, asegúrate de haber concedido los permisos necesarios.');
        safeSetIsLoading(false);
        return;
      }

      const credential = FacebookAuthProvider.credential(token);
      const userCredential = await signInWithCredential(auth, credential);
      
      if (userCredential.user && isMountedRef.current) {
        const termsAccepted = await checkTermsAccepted();
        if (termsAccepted) {
          router.replace('/(tabs)');
        } else {
          router.replace('/privacy');
        }
      }
    } catch (err: any) {
      console.error('Error en autenticación:', err);
      
      if (err.code === 'auth/account-exists-with-different-credential') {
        Alert.alert(
          'Error', 
          'Ya existe una cuenta con el mismo email pero con un método de autenticación diferente.'
        );
      } else if (err.message.includes('invalid scopes')) {
        Alert.alert(
          'Error de configuración', 
          'La aplicación Facebook no tiene configurado correctamente el permiso de email.'
        );
      } else {
        Alert.alert('Error', 'Error al autenticar con Facebook: ' + err.message);
      }
      
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

  const styles = getStyles(isDarkMode);

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
              onPress={handleGoogleSignIn}
            >
              <Text style={styles.optionText}>Ingresa con Google</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={handleFacebookSignIn}
            >
              <Text style={styles.optionText}>
                Ingresa con Facebook
              </Text>
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
            
            <TouchableOpacity onPress={cancelEmailAuth}>
              <Text style={styles.cancelText}>Volver atrás</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const getStyles = (isDarkMode: boolean) => StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: isDarkMode ? '#121212' : '#FAFAFA',
    paddingHorizontal: 20
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  logo: {
    width: 500,
    height: 250,
    marginBottom: 20,
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 40, 
    color: isDarkMode ? '#FFFFFF' : '#1A237E',
    textAlign: 'center'
  },
  optionsContainer: {
    width: '100%',
    marginBottom: 20
  },
  optionButton: {
    width: '100%',
    padding: 16,
    borderWidth: 1,
    borderColor: isDarkMode ? '#555' : '#E8EAF6',
    borderRadius: 10,
    marginVertical: 8,
    backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF'
  },
  optionText: {
    textAlign: 'center',
    fontSize: 16,
    color: isDarkMode ? '#FFFFFF' : '#333333'
  },
  disabledOptionText: {
    color: isDarkMode ? '#666' : '#999',
    fontStyle: 'italic'
  },
  divider: {
    marginVertical: 15,
    color: isDarkMode ? '#AAAAAA' : '#666666',
    fontSize: 16,
    fontWeight: 'bold'
  },
  continueWithoutAccount: {
    color: isDarkMode ? '#BB86FC' : '#5C6BC0',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 30
  },
  emailAuthContainer: {
    width: '100%',
    marginBottom: 20
  },
  emailAuthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: isDarkMode ? '#FFFFFF' : '#1A237E',
    marginBottom: 20,
    textAlign: 'center'
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: isDarkMode ? '#555' : '#E8EAF6',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: isDarkMode ? '#FFFFFF' : '#333333',
    backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF'
  },
  authButtonsContainer: {
    width: '100%',
    alignItems: 'center'
  },
  authButton: {
    width: '100%',
    height: 50,
    backgroundColor: isDarkMode ? '#BB86FC' : '#5C6BC0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  cancelText: {
    color: isDarkMode ? '#BB86FC' : '#5C6BC0',
    marginTop: 10
  },
  loadingText: {
    marginTop: 10,
    color: isDarkMode ? '#FFFFFF' : '#333333'
  }
});