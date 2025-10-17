import { ThemedView } from '@/components/ThemedView';
import { WelcomeContent, WelcomeOverlay } from '@/components/welcome/WelcomeComponents'; // Import the specific components of the welcome screen
import { useWelcome } from '@/hooks/useWelcome'; // Import the custom hook that handles the welcome logic
import { View, useColorScheme } from 'react-native';

export default function WelcomeScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const { showMessage, handleGetStarted } = useWelcome();

  return (
    <View style={{ flex: 1 }}>
      <ThemedView style={{ flex: 1 }}>
        <WelcomeContent 
          isDarkMode={isDarkMode} 
          onGetStarted={handleGetStarted} 
        />
        
        <WelcomeOverlay 
          isDarkMode={isDarkMode} 
          showMessage={showMessage} 
        />
      </ThemedView>
    </View>
  );
}