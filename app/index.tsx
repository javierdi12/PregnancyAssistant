<<<<<<< Updated upstream
=======
<<<<<<< HEAD
import { makeRedirectUri } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
=======
>>>>>>> ada5de236c386a75f6f178c0f6f084a3c9c6b224
>>>>>>> Stashed changes
import { router } from 'expo-router';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert, Image, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity,
    View, useColorScheme
} from 'react-native';
import { auth } from '../Firebase';




export default function LoginScreen() {
<<<<<<< Updated upstream
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeAuth, setActiveAuth] = useState<'none' |'email' | 'google'>('none');
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';

    
    // If the user is ALREADY logged in, send them directly to tabs
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) router.replace('/privacy');
        });
        return unsubscribe;
    }, []);

    const signIn = async () => {
        try {
            const user = await signInWithEmailAndPassword(auth, email, password);
            if (user) router.replace('/privacy');
        } catch (error) {
            const errorMsg = error && typeof error === 'object' && 'message' in error ? error.message : String(error);
            Alert.alert('Error', 'Error al iniciar sesión: ' + errorMsg);
        }
    };

    const signUp = async () => {
        try {
            const user = await createUserWithEmailAndPassword(auth, email, password);
            if (user) router.replace('/privacy');
        } catch (error) {
            const errorMsg = error && typeof error === 'object' && 'message' in error ? error.message : String(error);
            Alert.alert('Error', 'Error al crear cuenta: ' + errorMsg);
        }
    };

    const handleGoogleSignIn = () => {
        Alert.alert('Google Sign-In', 'Esta funcionalidad requiere configuración adicional');
    // Here you would implement the Google Sign-In logic when you configure it.
    };

    const handleFacebookSignIn = () => {
        Alert.alert('Facebook Sign-In', 'Esta funcionalidad requiere configuración adicional');
    };
=======
<<<<<<< HEAD

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({

    clientId: "265408256669-0iorks9oqjvmt9i5ngq55m3mudnfkdam.apps.googleusercontent.com", // Web Client ID
    androidClientId: "265408256669-f5n7gm8osgrhv8k0jjb5nan1md0um38s.apps.googleusercontent.com", // Android Client ID
    redirectUri: makeRedirectUri({
      scheme: "pregnancyassistant", //scheme en app.json
    }),
    
  });


  useEffect(() => {
    if (response?.type === 'success') {

      const { id_token } = response.params;


      const credential = GoogleAuthProvider.credential(id_token);


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
=======
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeAuth, setActiveAuth] = useState<'none' |'email' | 'google'>('none');
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
>>>>>>> Stashed changes

    
    // If the user is ALREADY logged in, send them directly to tabs
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) router.replace('/privacy');
        });
        return unsubscribe;
    }, []);

<<<<<<< Updated upstream
    const continueWithoutAccount = () => {
=======
    const signIn = async () => {
        try {
            const user = await signInWithEmailAndPassword(auth, email, password);
            if (user) router.replace('/privacy');
        } catch (error) {
            const errorMsg = error && typeof error === 'object' && 'message' in error ? error.message : String(error);
            Alert.alert('Error', 'Error al iniciar sesión: ' + errorMsg);
        }
    };

    const signUp = async () => {
        try {
            const user = await createUserWithEmailAndPassword(auth, email, password);
            if (user) router.replace('/privacy');
        } catch (error) {
            const errorMsg = error && typeof error === 'object' && 'message' in error ? error.message : String(error);
            Alert.alert('Error', 'Error al crear cuenta: ' + errorMsg);
        }
    };

    const handleGoogleSignIn = () => {
        Alert.alert('Google Sign-In', 'Esta funcionalidad requiere configuración adicional');
    // Here you would implement the Google Sign-In logic when you configure it.
    };

    const handleFacebookSignIn = () => {
        Alert.alert('Facebook Sign-In', 'Esta funcionalidad requiere configuración adicional');
    };
>>>>>>> ada5de236c386a75f6f178c0f6f084a3c9c6b224

  const handleGoogleSignIn = () => {

<<<<<<< HEAD
    if (request) {
      promptAsync();
    } else {
      Alert.alert("Cargando", "El inicio de sesión con Google se está preparando, por favor espera un momento.");
    }
  };

  const signIn = async () => {
    try {
      const user = await signInWithEmailAndPassword(auth, email, password);
      if (user) router.replace('/privacy');
    } catch (error) {
      const errorMsg = error && typeof error === 'object' && 'message' in error ? error.message : String(error);
      Alert.alert('Error', 'Error al iniciar sesión: ' + errorMsg);
    }
  };

  const signUp = async () => {
    try {
      const user = await createUserWithEmailAndPassword(auth, email, password);
      if (user) router.replace('/privacy');
    } catch (error) {
      const errorMsg = error && typeof error === 'object' && 'message' in error ? error.message : String(error);
      Alert.alert('Error', 'Error al crear cuenta: ' + errorMsg);
    }
  };

  const handleFacebookSignIn = () => {
    Alert.alert('Facebook Sign-In', 'Esta funcionalidad requiere configuración adicional');
  };

  const continueWithoutAccount = () => {
=======
    const continueWithoutAccount = () => {
>>>>>>> ada5de236c386a75f6f178c0f6f084a3c9c6b224
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream

        <Image 
                source={require('../assets/images/index.png')} // ← Path to your image
                style={styles.logo}
                resizeMode="contain"
            />
      <Text style={styles.title}>Bienvenida{'\n'}
        Prenagnancy Assistant</Text>
=======
<<<<<<< HEAD
      <Image
        source={require('../assets/images/index.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Bienvenida{'\n'}
        Prenagnancy Assistant</Text>

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

            <TouchableOpacity onPress={cancelEmailAuth}>
              <Text style={styles.cancelText}>Volver atrás</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
=======

        <Image 
                source={require('../assets/images/index.png')} // ← Path to your image
                style={styles.logo}
                resizeMode="contain"
            />
      <Text style={styles.title}>Bienvenida{'\n'}
        Prenagnancy Assistant</Text>
>>>>>>> Stashed changes
      
              {activeAuth !== 'email' ? (
                // SHOW SOCIAL LOGIN OPTIONS (when NOT in email mode)
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
                // SHOW EMAIL FORM (when in email mode)
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
<<<<<<< Updated upstream
=======
>>>>>>> ada5de236c386a75f6f178c0f6f084a3c9c6b224
>>>>>>> Stashed changes
}

// Tus estilos (getStyles) no necesitan cambiar.
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
<<<<<<< Updated upstream
        width: 500, // Adjust the size
        height: 250, // Adjust the size
        marginBottom: 20, // Space between the image and the title
    },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 40, 
    color: isDarkMode ? '#FFFFFF' : '#1A237E',
    textAlign: 'center'
  },
=======
<<<<<<< HEAD
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
=======
        width: 500, // Adjust the size
        height: 250, // Adjust the size
        marginBottom: 20, // Space between the image and the title
    },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 40, 
    color: isDarkMode ? '#FFFFFF' : '#1A237E',
    textAlign: 'center'
  },
>>>>>>> Stashed changes
   titleBold: {
        fontWeight: 'bold',
        fontSize: 26, 
    },
<<<<<<< Updated upstream
=======
>>>>>>> ada5de236c386a75f6f178c0f6f084a3c9c6b224
>>>>>>> Stashed changes
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