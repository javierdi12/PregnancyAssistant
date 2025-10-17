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

// Custom hook that retrieves user information from Firestore
// Receives a userId parameter (can be a string, undefined, or an array of strings)
export const useUserProfileView = (userId: string | undefined | string[]) => {
  const [user, setUser] = useState<UserProfile | null>(null); // Status that stores user information (or null if not loaded)
  const [loading, setLoading] = useState(true);// Status indicating whether the information is loading
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {// Used to load user profile data from Firestore.
    const fetchUserProfile = async () => {
      // Ensure userId is a valid string
      if (!userId || typeof userId !== 'string') {
        setLoading(false);
        setError('User ID inválido.');
        return;// Exits the function if the ID is invalid
      }

      try {
        setLoading(true);// Indicates that loading is in progress
        const userDocRef = doc(db, 'users', userId);  // Create a reference to the user document within the ‘users’ collection
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {// If the document exists, save the data in the ‘user’ state.
          setUser(userDocSnap.data() as UserProfile);
        } else {
          setError('No se encontró el perfil del usuario.');
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);// If an error occurs (network or permission issues), it displays it in the console.
        setError('Ocurrió un error al cargar el perfil.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();// Call the function that loads the profile
  }, [userId]);

  return { user, loading, error };
};
