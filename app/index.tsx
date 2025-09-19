import * as Google from "expo-auth-session/providers/google";
import { router } from 'expo-router';
import * as WebBrowser from "expo-web-browser";
import { GoogleAuthProvider, createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithCredential, signInWithEmailAndPassword } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, Image, SafeAreaView, StyleSheet, Text, TextInput,
  TouchableOpacity, View, useColorScheme
} from 'react-native';
import { auth } from '../FireBase';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: "265408256669-0iorks9oqjvmt9i5ngq55m3mudnfkdam.apps.googleusercontent.com",
    androidClientId: "265408256669-f5n7gm8osgrhv8k0jjb5nan1md0um38s.apps.googleusercontent.com",
    //redirectUri: makeRedirectUri({
    //scheme: "pregnancyassistant",
    //}),
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      console.log('OAuth response:', response);

      signInWithCredential(auth, credential)
        .catch((error: { code?: string; message?: string }) => {
          console.error("Error al iniciar sesión en Firebase:", error);
          Alert.alert("Error", "No se pudo iniciar sesión en Firebase.");
        });
    } else if (response?.type === 'error') {
      Alert.alert('Error de Autenticación', response.error?.message || 'Ocurrió un error desconocido.');
    }
  }, [response]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log(JSON.stringify(user));
        router.replace('/privacy');
      }
    });
    return () => unsubscribe();
  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeAuth, setActiveAuth] = useState<'none' | 'email' | 'google'>('none');
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const handleGoogleSignIn = () => {
    if (request) {
      promptAsync();
    } else {
      Alert.alert("Cargando", "El inicio de sesión con Google se está preparando, por favor espera un momento.");
    }
  };

  const signIn = async () => {
    if (!email || !password) {
      Alert.alert('Campos requeridos', 'Por favor, ingresa tu correo y contraseña.');
      return;
    }
    if (!isValidEmail(email)) {
      Alert.alert('Email inválido', 'Por favor, ingresa un correo electrónico válido.');
      return;
    }
    try {
      setIsLoading(true);
      const user = await signInWithEmailAndPassword(auth, email, password);
      if (user) router.replace('/privacy');
    } catch (error) {
      console.log('Error crudo recibido en signIn:', JSON.stringify(error));
      const errorMsg = getFirebaseErrorMessage(error);
      Alert.alert('Error', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async () => {
    if (!email || !password) {
      Alert.alert('Campos requeridos', 'Por favor, ingresa tu correo y contraseña.');
      return;
    }
    if (!isValidEmail(email)) {
      Alert.alert('Email inválido', 'Por favor, ingresa un correo electrónico válido.');
      return;
    }
    try {
      setIsLoading(true);
      const user = await createUserWithEmailAndPassword(auth, email, password);
      if (user) router.replace('/privacy');
    } catch (error) {
      console.log('Error crudo recibido en signUp:', JSON.stringify(error));
      const errorMsg = getFirebaseErrorMessage(error);
      Alert.alert('Error', errorMsg);
    } finally {
      setIsLoading(false);
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


  const handleFacebookSignIn = () => {
    Alert.alert('Facebook Sign-In', 'Esta funcionalidad requiere configuración adicional');
  };

  const continueWithoutAccount = () => {
    router.replace('/privacy');
  };

  const cancelEmailAuth = () => {
    setActiveAuth('none');
  };

  const styles = getStyles(isDarkMode);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={isDarkMode ? '#BB86FC' : '#5C6BC0'} />
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
              onPress={() => setActiveAuth('email')}
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
              <Text style={styles.optionText}>Ingresa con Facebook</Text>
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
              <Text style={[styles.cancelText, { textAlign: 'center', marginBottom: 12 }]}>
                ¿Olvidaste tu contraseña?
              </Text>
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
function isValidEmail(email: string): boolean {
  
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getFirebaseErrorMessage(error: any): string {
  // Itry to get code directly
  let code = error?.code;

  //obtain code from customData if not present
  if (!code && error?.customData?._tokenResponse?.error?.message) {
    const apiMsg = error.customData._tokenResponse.error.message;
    // mapping 
    if (apiMsg === "EMAIL_EXISTS") code = "auth/email-already-in-use";
    if (apiMsg === "EMAIL_NOT_FOUND") code = "auth/user-not-found";
    if (apiMsg === "INVALID_PASSWORD") code = "auth/wrong-password";
    if (apiMsg === "WEAK_PASSWORD") code = "auth/weak-password";

  }

  // amigable message
  switch (code) {
    case 'auth/email-already-in-use':
      return "El correo ya está registrado. Intenta iniciar sesión o usa otro correo.";
    case 'auth/weak-password':
      return "La contraseña es muy débil. Usa al menos 6 caracteres.";
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return "Correo o contraseña incorrectos. Intenta de nuevo.";
    case 'auth/invalid-email':
      return "El formato del correo es inválido.";
    default:
      return "Ocurrió un error inesperado: " + (error?.message ?? "Desconocido");
  }
}



// --- styles ---
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
  },
  emailAuthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: isDarkMode ? '#FFFFFF' : '#1A237E',
    marginBottom: 20,
    textAlign: 'center'
  }
});
