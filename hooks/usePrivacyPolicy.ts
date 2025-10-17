import { db } from '@/FireBase';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export const usePrivacyPolicy = () => {
  const [privacyContent, setPrivacyContent] = useState('');// Status that will store the content of the privacy policy
  const [loading, setLoading] = useState(true);

  const loadPrivacyContent = async () => {// Function to load policy content from Firestore
    try {
      setLoading(true);// Enable charging status
      
      const docRef = doc(db, 'privacy_policies', 'current_policy'); // Reference to the document ‘current_policy’ within the collection 'privacy_policies'
      const docSnap = await getDoc(docRef);// Get the document from Firestore
      
      if (docSnap.exists()) {// If the document exists, extract the content
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

  return {// Returns the policy content and loading status
    privacyContent,
    loading
  };
};