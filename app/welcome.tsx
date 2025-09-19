import { ThemedText } from '@/components/ThemedText'; // Import light/dark theme text component
import { ThemedView } from '@/components/ThemedView'; // Import light/dark theme view
import { useNavigation, useRouter } from 'expo-router';
import { useLayoutEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View, useColorScheme } from 'react-native';

export default function WelcomeScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [showMessage, setShowMessage] = useState(false);
  const colorScheme = useColorScheme();  // Detects the system theme (‘light’ | ‘dark’)
  const isDarkMode = colorScheme === 'dark'; // Boolean helper to determine if it is in dark mode

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });// Hide the header 
  }, [navigation]);

  const handleGetStarted = () => { // Function called when pressing the “Next” button
    setShowMessage(true);// Display the overlay with a motivational message
    setTimeout(() => { 
      setShowMessage(false);
      router.replace('/(tabs)');
    }, 2000);
  };

  const styles = getStyles(isDarkMode);  // Generate dynamic styles if in dark mode

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image 
          source={require('../assets/images/welcome.png')}
          style={styles.welcomeImage}
          resizeMode="contain"
        />
        
      
          <ThemedText style={styles.welcomeText}>
            ¡Bienvenida a tu aplicación de seguimiento del embarazo!
          </ThemedText>
          
        

          <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
            <ThemedText style={styles.buttonText}>Siguiente</ThemedText>
          </TouchableOpacity>
        
      </ScrollView>

      {showMessage && (
        <ThemedView style={styles.overlay}>
          <ThemedText style={styles.overlayText}>
            Estás a punto de vivir un viaje lleno de amor y cambios hermosos.
          </ThemedText>
        </ThemedView>
      )}
    </View>
  );
}

const getStyles = (isDarkMode: boolean) => StyleSheet.create({ // Function that returns styles according to theme
  container: { 
    flex: 1, 
    backgroundColor: isDarkMode ? '#121212' : '#FAFAFA',// Dark or light background
  },
  scrollContainer: {
    flexGrow: 1, // Allows content to grow and scroll
    justifyContent: 'flex-start', // Content aligned vertically at the top
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 100,
  },
  welcomeImage: {
    width: 550,
    height: 300,
    marginBottom: 50,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  welcomeText: {
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 40, // Bottom spacing
    color: isDarkMode ? '#FFFFFF' : '#1A237E',// Dynamic color according to theme
    textAlign: 'center',
    lineHeight: 32,
  },
  button: {
    width: '60%',
    height: 50,
    backgroundColor: isDarkMode ? '#06B6D4' : '#06B6D4',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 250
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  overlay: {
    ...StyleSheet.absoluteFillObject, //  Fills the entire screen
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: isDarkMode ? '#000000' : '#FFFFFF', //  Solid background according to theme
  },
  overlayText: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 30,
    color: isDarkMode ? '#FFFFFF' : '#000000', // Contrasting text
    padding: 20,
  },
});