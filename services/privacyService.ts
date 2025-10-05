import { db } from '@/FireBase';
import { doc, getDoc } from 'firebase/firestore';

export const getPrivacyPolicy = async () => {
  try {
    const docRef = doc(db, 'privacy_policies', 'current_policy');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.warn('No existe la política de privacidad en Firestore.');
      return null;
    }
  } catch (error) {
    console.error('Error al obtener la política de privacidad:', error);
    return null;
  }
};
