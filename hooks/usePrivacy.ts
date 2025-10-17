import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage to store data locally on the device
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native'; // Import Alert to display alerts in the app

export const usePrivacy = () => {// Custom hook to handle privacy acceptance and announcements
  const [dataUsageAccepted, setDataUsageAccepted] = useState(false);// Status indicating whether the user accepted the use of essential data
  const [personalizedAdsAccepted, setPersonalizedAdsAccepted] = useState(false); // Status indicating whether the user accepted personalized ads
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);// Status to control whether the privacy modal is displayed
  const router = useRouter(); // Navigation hook to redirect the user

  const handleAcceptNecessary = () => { // Function that runs when the user only accepts the necessary data
    setDataUsageAccepted(true);
    setPersonalizedAdsAccepted(false);
  };

  const handleAcceptAll = () => { // Function that runs when the user accepts everything
    setDataUsageAccepted(true);
    setPersonalizedAdsAccepted(true);
  };

  const handleContinue = async () => {// Function that runs when continuing after accepting privacy policy
    if (!dataUsageAccepted) {// If essential data is not accepted, display an alert and do not continue.
      Alert.alert(
        'Atención',
        'Debes aceptar el uso de datos esenciales para continuar',
        [{ text: 'Entendido' }]
      );
      return;
    }

    try {
      await AsyncStorage.setItem('terms_accepted', 'true');// Save in AsyncStorage that the terms were accepted
      await AsyncStorage.setItem(
        'ads_accepted',
        personalizedAdsAccepted ? 'true' : 'false'
      );
      router.replace('/welcome');// Redirects the user to the welcome screen
    } catch (error) {
      console.error('Error guardando términos:', error);
    }
  };

  return {  // Returns all states and functions to use in the UI
    dataUsageAccepted,
    setDataUsageAccepted,
    personalizedAdsAccepted,
    setPersonalizedAdsAccepted,
    showPrivacyModal,
    setShowPrivacyModal,
    handleAcceptNecessary,
    handleAcceptAll,
    handleContinue,
  };
};