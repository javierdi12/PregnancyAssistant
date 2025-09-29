import { ThemedView } from '@/components/ThemedView';
import {
  HomeIndicator,
  PrivacyContent,
  PrivacyHeader,
  PrivacyModal,
} from '@/components/privacy/PrivacyComponents';
import { usePrivacy } from '@/hooks/usePrivacy';
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

  return (
    <ThemedView style={{ flex: 1 }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent />
      
      <PrivacyHeader isDark={isDark} onBack={() => window.history.back()} />
      
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
      />
      
      <HomeIndicator isDark={isDark} />
    </ThemedView>
  );
}