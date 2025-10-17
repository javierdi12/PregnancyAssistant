import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import * as React from 'react';
import { auth } from '../FireBase';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const [isLoading, setIsLoading] = React.useState(false);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    
    // EAS/Dev Client nativos:
    androidClientId: '265408256669-f5n7gm8osgrhv8k0jjb5nan1md0um38s.apps.googleusercontent.com',
    webClientId : '265408256669-0iorks9oqjvmt9i5ngq55m3mudnfkdam.apps.googleusercontent.com',
  });

  React.useEffect(() => {
    const go = async () => {
      if (response?.type !== 'success') return;
      setIsLoading(true);
      try {
        
        const idToken =
          response.authentication?.idToken ?? (response.params as any)?.id_token;
        if (!idToken) throw new Error('No se recibió idToken de Google');

        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, credential);
        // No navegues aquí: onAuthStateChanged hará el redirect
      } finally {
        setIsLoading(false);
      }
    };
    go();
  }, [response]);

  const handleGoogleSignIn = async () => {
    if (!request) throw new Error('Solicitud de Google aún no lista');
    await promptAsync(); // abre flujo OAuth
  };

  return { handleGoogleSignIn, isLoading: isLoading || !request };
}
