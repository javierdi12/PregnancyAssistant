import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

export const usePrivacy = () => {
  const [dataUsageAccepted, setDataUsageAccepted] = useState(false);
  const [personalizedAdsAccepted, setPersonalizedAdsAccepted] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const router = useRouter();

  const handleAcceptNecessary = () => {
    setDataUsageAccepted(true);
    setPersonalizedAdsAccepted(false);
  };

  const handleAcceptAll = () => {
    setDataUsageAccepted(true);
    setPersonalizedAdsAccepted(true);
  };

  const handleContinue = async () => {
    if (!dataUsageAccepted) {
      Alert.alert(
        'Atención',
        'Debes aceptar el uso de datos esenciales para continuar',
        [{ text: 'Entendido' }]
      );
      return;
    }

    try {
      await AsyncStorage.setItem('terms_accepted', 'true');
      await AsyncStorage.setItem(
        'ads_accepted',
        personalizedAdsAccepted ? 'true' : 'false'
      );
      router.replace('/welcome');
    } catch (error) {
      console.error('Error guardando términos:', error);
    }
  };

  return {
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