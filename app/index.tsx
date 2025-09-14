import { router } from 'expo-router';
import {
  FacebookAuthProvider,
  createUserWithEmailAndPassword,
  signInWithCredential,
  signInWithEmailAndPassword
} from 'firebase/auth';
import React, { useEffect, useRef, useState } from 'react';
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
import { auth } from '../FireBase';

const FACEBOOK_APP_ID = '1892374498008258';

// Definir tipos para los intervalos (solución para React Native/TypeScript)
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

  // If the user is ALREADY logged in, send them directly to tabs
  useEffect(() => {
    isMountedRef.current = true;

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && isMountedRef.current) {
        router.replace('/privacy');
      }
    });

    return () => {
      isMountedRef.current = false;
      unsubscribe();
      
      // Limpiar intervalos y timeouts
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
    try {
      const user = await signInWithEmailAndPassword(auth, email, password);
      if (user && isMountedRef.current) {
        router.replace('/privacy');
      }
    } catch (err) {
      const errorMsg = err && typeof err === 'object' && 'message' in err ? err.message : String(err);
      Alert.alert('Error', 'Error al iniciar sesión: ' + errorMsg);
    } finally {
      safeSetIsLoading(false);
    }
  };

  const signUp = async () => {
    safeSetIsLoading(true);
    try {
      const user = await createUserWithEmailAndPassword(auth, email, password);
      if (user && isMountedRef.current) {
        router.replace('/privacy');
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
      // INTENTAR LOGIN EN TODAS LAS PLATAFORMAS
      if (Platform.OS === 'web') {
        await handleFacebookWebLogin();
      } else {
        // En iOS/Android, mostrar mensaje y redirigir a login web
        Alert.alert(
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

  const handleFacebookMobileRedirect = () => {
    // Redirigir a la URL de Facebook para login en móvil
    const redirectUri = `https://${window.location.hostname || 'localhost'}`;
    const authUrl = `https://www.facebook.com/v17.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=public_profile,email`;
    
    // Abrir en el navegador
    window.location.href = authUrl;
  };

  const handleFacebookWebLogin = async () => {
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
    
    // Limpiar intervalos previos
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    // SOLUCIÓN: Usar el tipo correcto para setInterval
    intervalRef.current = setInterval(() => {
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
        console.error('Interval error:', intervalError); // Explicitly use intervalError
        // Error cross-origin normal, continuar verificando
      }
    }, 100) as unknown as IntervalHandle;
    
    // SOLUCIÓN: Usar el tipo correcto para setTimeout
    timeoutRef.current = setTimeout(() => {
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

  const fetchFacebookUserInfo = async (accessToken: string) => {
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

  const handleFacebookToken = async (token: string) => {
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
        console.log("Usuario autenticado:", userCredential.user.email);
        router.replace('/privacy');
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