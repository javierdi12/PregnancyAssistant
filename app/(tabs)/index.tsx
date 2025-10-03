import { router } from 'expo-router';
import { useEffect } from 'react';
import {
  Alert,
  ScrollView,
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
      <ScrollView>
        <ThemedText style={styles.title}>Home</ThemedText>

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
          
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/community')}>
            <Feather name="feather" size={24} color={styles.quickActionButtonText.color} />
            <ThemedText style={styles.quickActionButtonText}>Community</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/(tabs)/map')}>
            <Feather name="map" size={24} color={styles.quickActionButtonText.color} />
            <ThemedText style={styles.quickActionButtonText}>Map</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/(tabs)/profile')}>
            <Feather name="user" size={24} color={styles.quickActionButtonText.color} />
            <ThemedText style={styles.quickActionButtonText}>Profile</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const getStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#121212' : '#FAFAFA',
    },
    title: {
      fontSize: 32,
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
      width: '100%',
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
      marginTop: 20,
      marginBottom: 40,
      width: '100%',
    },
    quickActionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#2a2a2a' : '#F5F5F5',
      padding: 20,
      borderRadius: 12,
      width: '100%',
      marginBottom: 25,
    },
    quickActionButtonText: {
      marginLeft: 15,
      fontSize: 18,
      fontWeight: 'bold',
      color: isDarkMode ? '#FFFFFF' : '#333333',
    },
    logoutButton: {
      backgroundColor: '#FF3D00',
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 24,
      alignSelf: 'center',
      marginBottom: 20,
    },
    logoutText: {
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
  });
