import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import * as React from 'react';
import { Alert, Platform } from 'react-native';
import { auth, db } from '../FireBase';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const [isLoading, setIsLoading] = React.useState(false);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    androidClientId: '265408256669-f5n7gm8osgrhv8k0jjb5nan1md0um38s.apps.googleusercontent.com',
    webClientId : '265408256669-0iorks9oqjvmt9i5ngq55m3mudnfkdam.apps.googleusercontent.com',
    redirectUri: Platform.OS === 'web' 
      ? window.location.origin 
      : 'com.preganassist.pregnancyassistant:/',
    selectAccount: true,
  });

  // Función para guardar perfil de Google en Firestore
  const saveGoogleUserProfile = async (userId: string, userEmail: string | null, displayName: string | null, photoURL: string | null) => {
    try {
      await setDoc(doc(db, 'users', userId), {
        email: userEmail,
        displayName: displayName || userEmail?.split('@')[0] || 'Usuario Google',
        role: 'google', // Rol por defecto para usuarios de Google
        photoURL: photoURL,
        provider: 'google',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        emailVerified: true, 
        // Default empty fields for profile
        firstName: '',
        lastName: '',
        dateOfBirth: null,
        province: '',
        canton: '',
        district: '',
        // Profile completion status
        profileCompleted: false
      }, { merge: true }); // merge true for updating existing users
      
      console.log('Perfil de usuario Google guardado en Firestore');
    } catch (error) {
      console.error('Error guardando perfil de Google en Firestore:', error);
      throw error;
    }
  };

  React.useEffect(() => {
    let isMounted = true;
    
    const go = async () => {
      if (response?.type === 'success' && isMounted) {
        setIsLoading(true);
        try {
          const idToken =
            response.authentication?.idToken ?? (response.params as any)?.id_token;
          if (!idToken) throw new Error('No se recibió idToken de Google');

          const credential = GoogleAuthProvider.credential(idToken);
          const userCredential = await signInWithCredential(auth, credential);
          const user = userCredential.user;

          // Guardar perfil del usuario en Firestore
          await saveGoogleUserProfile(
            user.uid, 
            user.email, 
            user.displayName, 
            user.photoURL
          );

          // Esperamos un momento para asegurarnos que Firebase procese la autenticación
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error) {
          if (isMounted) {
            console.error('Error en autenticación con Google:', error);
            Alert.alert('Error', 'No se pudo iniciar sesión con Google');
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      } else if (response?.type === 'error' && isMounted) {
        console.error('Error en respuesta de Google:', response.error);
        Alert.alert('Error', 'Hubo un problema al iniciar sesión con Google');
      }
    };
    
    go();

    return () => {
      isMounted = false;
    };
  }, [response]);

  const handleGoogleSignIn = async () => {
    if (!request) throw new Error('Solicitud de Google aún no lista');
    await promptAsync(); 
  };

  return { handleGoogleSignIn, isLoading: isLoading || !request };
}