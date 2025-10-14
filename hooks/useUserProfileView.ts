import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../FireBase';

// Define the structure of the user profile data
interface UserProfile {
  nombre: string;
  apellidos: string;
  photoURL?: string;
  provincia?: string;
  canton?: string;
  distrito?: string;
  
}

export const useUserProfileView = (userId: string | undefined | string[]) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      // Ensure userId is a valid string
      if (!userId || typeof userId !== 'string') {
        setLoading(false);
        setError('User ID inválido.');
        return;
      }

      try {
        setLoading(true);
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setUser(userDocSnap.data() as UserProfile);
        } else {
          setError('No se encontró el perfil del usuario.');
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError('Ocurrió un error al cargar el perfil.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  return { user, loading, error };
};
