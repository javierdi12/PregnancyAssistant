import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from '../FireBase';

/**
 * Checks if a user profile document exists in Firestore. If not, it creates one
 * with default values to ensure every authenticated user has a profile.
 * @param {User} user - The Firebase Auth user object.
 */
export const getOrCreateUserProfile = async (user: User) => {
  if (!user) return;

  const userDocRef = doc(db, 'users', user.uid);
  const docSnap = await getDoc(userDocRef);

  if (!docSnap.exists()) {
    // If the document does not exist, create it with default values
    try {
      await setDoc(userDocRef, {
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'Usuario Anónimo',
        email: user.email,
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
        // Default empty fields
        firstName: '',
        lastName: '',
        dateOfBirth: null,
        province: '',
        canton: '',
        district: '',
      });
      console.log(`Created new user profile for: ${user.uid}`);
    } catch (error) {
      console.error("Error creating user profile document:", error);
    }
  }
};
