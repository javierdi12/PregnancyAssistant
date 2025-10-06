import { db } from '@/FireBase';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export const usePrivacyPolicy = () => {
  const [privacyContent, setPrivacyContent] = useState('');
  const [loading, setLoading] = useState(true);

  const loadPrivacyContent = async () => {
    try {
      setLoading(true);
      
      const docRef = doc(db, 'privacy_policies', 'current_policy');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.privacyContent) {
          setPrivacyContent(data.privacyContent);
        } else {
          setPrivacyContent('Política de privacidad no disponible en este momento.');
        }
      } else {
        setPrivacyContent('Política de privacidad no disponible en este momento.');
      }
    } catch (error) {
      console.error('Error loading privacy content:', error);
      setPrivacyContent('Error al cargar la política de privacidad. Por favor, intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrivacyContent();
  }, []);

  return {
    privacyContent,
    loading
  };
};