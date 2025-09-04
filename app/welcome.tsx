import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useNavigation, useRouter } from 'expo-router';
import { useLayoutEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export default function WelcomeScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [showMessage, setShowMessage] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleGetStarted = () => {
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
      router.replace('/(tabs)');
    }, 2000);
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedView style={styles.content}>
          <ThemedView style={styles.mainContent}>
            <ThemedText style={styles.welcomeText}>
              ¡Bienvenida a tu aplicación de seguimiento del embarazo!
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
              <ThemedText style={styles.buttonText}>Siguiente</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </ScrollView>

      {showMessage && (
        <ThemedView style={styles.overlay}>
          <ThemedText style={styles.overlayText}>
            Estás a punto de vivir un viaje lleno de amor y cambios hermosos.
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 32,
    justifyContent: 'space-between',
    minHeight: '100%',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    backgroundColor: '#06B6D4',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 35,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlayText: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 30,
  },
});
