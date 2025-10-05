import { ThemedView } from '@/components/ThemedView';
import {
  HomeIndicator,
  PrivacyContent,
  PrivacyHeader,
  PrivacyModal,
} from '@/components/privacy/PrivacyComponents';
import { usePrivacy } from '@/hooks/usePrivacy';
import { usePrivacyPolicy } from '@/hooks/usePrivacyPolicy';
import { router } from 'expo-router';
import { StatusBar, useColorScheme } from 'react-native';

export default function PrivacyScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const {
    dataUsageAccepted,
    setDataUsageAccepted,
    personalizedAdsAccepted,
    setPersonalizedAdsAccepted,
    showPrivacyModal,
    setShowPrivacyModal,
    handleAcceptNecessary,
    handleAcceptAll,
    handleContinue,
  } = usePrivacy();

  // Obtener el contenido de la política desde Firebase
  const { privacyContent, loading } = usePrivacyPolicy();

  // Función para manejar el botón de retroceso
   const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/'); 
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent />
      
      <PrivacyHeader isDark={isDark} onBack={handleBack} />
      
      <PrivacyContent
        isDark={isDark}
        dataUsageAccepted={dataUsageAccepted}
        setDataUsageAccepted={setDataUsageAccepted}
        personalizedAdsAccepted={personalizedAdsAccepted}
        setPersonalizedAdsAccepted={setPersonalizedAdsAccepted}
        onShowPrivacyModal={() => setShowPrivacyModal(true)}
        onAcceptNecessary={handleAcceptNecessary}
        onAcceptAll={handleAcceptAll}
        onContinue={handleContinue}
      />
      
      <PrivacyModal
        isDark={isDark}
        showPrivacyModal={showPrivacyModal}
        onCloseModal={() => setShowPrivacyModal(false)}
        privacyContent={privacyContent}
        loading={loading}
      />
      
      <HomeIndicator isDark={isDark} />
    </ThemedView>
  );
}