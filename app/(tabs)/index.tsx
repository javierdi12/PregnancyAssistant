import { router } from 'expo-router';
import { useEffect } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { auth } from '../../FireBase';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { Feather } from '@expo/vector-icons';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  // Redirect to login if not authenticated
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (!user) router.replace('/');
    });
    return unsubscribe;
  }, []);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.replace('/');
    } catch (error) {
      Alert.alert('Error', 'Error signing out: ' + String(error));
    }
  };

  const styles = getStyles(isDarkMode);

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Welcome to your Pregnancy Assistant</ThemedText>

      {/* Daily Tip Section */}
      <View style={styles.card}>
        <ThemedText style={styles.cardTitle}>Daily Tip</ThemedText>
        <ThemedText style={styles.cardText}>
          Stay hydrated by drinking plenty of water throughout the day. It&apos;s important for both you and your baby.
        </ThemedText>
      </View>

      {/* Quick Actions Section */}
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => router.push('/(tabs)/tracking')}>
          <Feather name="list" size={24} color={styles.quickActionButtonText.color} />
          <ThemedText style={styles.quickActionButtonText}>Pregnancy Tracking</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => router.push('/(tabs)/ai-assistant')}>
          <Feather name="cpu" size={24} color={styles.quickActionButtonText.color} />
          <ThemedText style={styles.quickActionButtonText}>AI Assistant</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ThemedView>
  );
}

const getStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      justifyContent: 'center',
      backgroundColor: isDarkMode ? '#121212' : '#FAFAFA',
    },
    title: {
      fontSize: 26,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 30,
      color: isDarkMode ? '#FFFFFF' : '#1A237E',
    },
    card: {
      backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
      borderRadius: 12,
      padding: 20,
      marginBottom: 30,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
      color: isDarkMode ? Colors.dark.tint : Colors.light.tint,
    },
    cardText: {
      fontSize: 16,
      lineHeight: 24,
      color: isDarkMode ? '#E0E0E0' : '#424242',
    },
    quickActionsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 40,
    },
    quickActionButton: {
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#2a2a2a' : '#F5F5F5',
      padding: 20,
      borderRadius: 12,
      width: '45%',
    },
    quickActionButtonText: {
      marginTop: 10,
      fontSize: 14,
      fontWeight: '600',
      color: isDarkMode ? '#FFFFFF' : '#333333',
    },
    logoutButton: {
      backgroundColor: '#FF3D00',
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 24,
      alignSelf: 'center',
    },
    logoutText: {
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
  });