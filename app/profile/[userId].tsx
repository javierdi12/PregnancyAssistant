import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useUserProfileView } from '@/hooks/useUserProfileView';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams();
  const { user, loading, error } = useUserProfileView(userId);

  const backgroundColor = useThemeColor({}, 'background');
  const cardBackgroundColor = useThemeColor({}, 'card');
  const tintColor = useThemeColor({}, 'tint');
  const defaultAvatar = Image.resolveAssetSource(require('@/assets/images/default-avatar.png')).uri;

  if (loading) {
    return (
      <ThemedView style={[styles.centered, { backgroundColor }]}>
        <ActivityIndicator size="large" color={tintColor} />
        <ThemedText>Cargando perfil...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={[styles.centered, { backgroundColor }]}>
        <Stack.Screen options={{ title: 'Error' }} />
        <ThemedText type="subtitle">{error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ title: `Perfil de ${user?.nombre || 'Usuario'}` }} />
      <View style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
        <Image
          source={{ uri: user?.photoURL || defaultAvatar }}
          style={styles.avatar}
        />
        <ThemedText type="title" style={styles.name}>
          {user?.nombre} {user?.apellidos}
        </ThemedText>
        
        {user?.provincia && (
          <ThemedText style={styles.location}>
            📍 {user.distrito}, {user.canton}, {user.provincia}
          </ThemedText>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  card: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  location: {
    fontSize: 16,
    color: '#666',
  },
});
