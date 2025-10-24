import { router } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  View,
  useColorScheme
} from 'react-native';
import { auth } from '../../FireBase';
import { registerForPushNotificationsAsync } from '../../services/notificationService';
import { getOrCreateUserProfile } from '../../services/userService';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getHomeStyles } from '@/styles';
import { Feather } from '@expo/vector-icons';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  // Redirect to login if not authenticated, or ensure profile exists and register for notifications if authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Ensure user profile exists before doing anything else
        await getOrCreateUserProfile(user);
        // Register for push notifications
        registerForPushNotificationsAsync();
      } else {
        // User is signed out, redirect to welcome screen
        router.replace('/');
      }
    });
    return unsubscribe;
  }, []);

  const styles = getHomeStyles(isDarkMode);

  return (
    <ThemedView style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header with decorative elements */}
            <View style={styles.headerContainer}>
              <ThemedText style={styles.subtitle}></ThemedText>
              <ThemedText style={styles.title}>Bienvenida</ThemedText>
            
            </View>
    
            {/* Daily Tip Card with emoji */}
            <View style={styles.tipCard}>
              
              <ThemedText style={styles.tipTitle}>✨ Mi Embarazo ✨</ThemedText>
              <ThemedText style={styles.tipText}>
             Te acompañaremos durante esta hermosa etapa
              </ThemedText>
            </View>

        {/* Quick Actions Grid - Updated for better centering */}
        <View style={styles.actionsGrid}>
          {/* Row 1 */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionCard, styles.actionCardPink]}
              onPress={() => router.push('/(tabs)/tracking')}>
              <View style={styles.actionIconContainer}>
                <Feather name="heart" size={28} color="#FF6B9D" />
              </View>
              <ThemedText style={styles.actionTitle}>Seguimiento</ThemedText>
              <ThemedText style={styles.actionSubtitle}>del Embarazo</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, styles.actionCardPurple]}
              onPress={() => router.push('/(tabs)/citas')}>
              <View style={styles.actionIconContainer}>
                <Feather name="calendar" size={28} color="#B794F6" />
              </View>
              <ThemedText style={styles.actionTitle}>Gestión</ThemedText>
              <ThemedText style={styles.actionSubtitle}>de Citas</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Row 2 */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionCard, styles.actionCardCoral]}
              onPress={() => router.push('/(tabs)/ai-assistant')}>
              <View style={styles.actionIconContainer}>
                <Feather name="message-circle" size={28} color="#FF8C69" />
              </View>
              <ThemedText style={styles.actionTitle}>Asistente</ThemedText>
              <ThemedText style={styles.actionSubtitle}>Inteligente</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, styles.actionCardMint]}
              onPress={() => router.push('/community')}>
              <View style={styles.actionIconContainer}>
                <Feather name="users" size={28} color="#63D5A8" />
              </View>
              <ThemedText style={styles.actionTitle}>Comunidad</ThemedText>
              <ThemedText style={styles.actionSubtitle}>de Mamás</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Row 3 */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionCard, styles.actionCardBlue]}
              onPress={() => router.push('/(tabs)/map')}>
              <View style={styles.actionIconContainer}>
                <Feather name="map-pin" size={28} color="#7BB4E8" />
              </View>
              <ThemedText style={styles.actionTitle}>Mapa</ThemedText>
              <ThemedText style={styles.actionSubtitle}>de Servicios</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, styles.actionCardRose]}
              onPress={() => router.push('/(tabs)/profile')}>
              <View style={styles.actionIconContainer}>
                <Feather name="user" size={28} color="#F4A4C5" />
              </View>
              <ThemedText style={styles.actionTitle}>Mi Perfil</ThemedText>
              <ThemedText style={styles.actionSubtitle}>Personal</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Decorative bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </ThemedView>
  );
}