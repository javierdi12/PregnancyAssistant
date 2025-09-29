import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getWelcomeStyles } from '@/styles/welcome';
import { Image, ScrollView, TouchableOpacity } from 'react-native';


const WELCOME_MESSAGES = {
  welcome: '¡Bienvenida a tu aplicación de seguimiento del embarazo!',
  overlay: 'Estás a punto de vivir un viaje lleno de amor y cambios hermosos.',
  button: 'Siguiente',
};

interface WelcomeContentProps {
  isDarkMode: boolean;
  onGetStarted: () => void;
}

export const WelcomeContent = ({ isDarkMode, onGetStarted }: WelcomeContentProps) => {
  const styles = getWelcomeStyles(isDarkMode);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Image 
        source={require('@/assets/images/welcome.png')}
        style={styles.welcomeImage}
        resizeMode="contain"
      />
      
      <ThemedText style={styles.welcomeText}>
        {WELCOME_MESSAGES.welcome}
      </ThemedText>
      
      <TouchableOpacity style={styles.button} onPress={onGetStarted}>
        <ThemedText style={styles.buttonText}>
          {WELCOME_MESSAGES.button}
        </ThemedText>
      </TouchableOpacity>
    </ScrollView>
  );
};

interface WelcomeOverlayProps {
  isDarkMode: boolean;
  showMessage: boolean;
}

export const WelcomeOverlay = ({ isDarkMode, showMessage }: WelcomeOverlayProps) => {
  const styles = getWelcomeStyles(isDarkMode);

  if (!showMessage) return null;

  return (
    <ThemedView style={styles.overlay}>
      <ThemedText style={styles.overlayText}>
        {WELCOME_MESSAGES.overlay}
      </ThemedText>
    </ThemedView>
  );
};