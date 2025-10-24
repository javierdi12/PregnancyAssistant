import { ThemedView } from '@/components/ThemedView';
import {
  HomeIndicator,
  PrivacyContent, // Main privacy content
  PrivacyHeader,
  PrivacyModal,
} from '@/components/privacy/PrivacyComponents';

import { usePrivacy } from '@/hooks/usePrivacy'; // Import custom hooks to handle privacy
import { usePrivacyPolicy } from '@/hooks/usePrivacyPolicy';
import { router } from 'expo-router';
import { StatusBar, useColorScheme } from 'react-native'; // Import StatusBar and hook to detect color scheme

export default function PrivacyScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const {
    dataUsageAccepted,          // Essential data acceptance status
    setDataUsageAccepted,      // Function to update data acceptance
    personalizedAdsAccepted,    // Personalized ad acceptance status
    setPersonalizedAdsAccepted,// Function to update ad acceptance
    showPrivacyModal,          // Status for displaying the privacy modal
    setShowPrivacyModal,       // Function to update the status of the modal
    handleAcceptNecessary,      // Function that accepts only essential data
    handleAcceptAll,           // Function that accepts everything
    handleContinue,           // Function that saves choices and moves forward
  } = usePrivacy();

  // Get the policy content from Firebase
  const { privacyContent, loading } = usePrivacyPolicy();

 
   const handleBack = () => { // Function to handle the back button
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
        onAcceptNecessary={handleAcceptNecessary} // Function to accept only necessary items
        onAcceptAll={handleAcceptAll} // Function to accept everything
        onContinue={handleContinue} // Function to continue
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