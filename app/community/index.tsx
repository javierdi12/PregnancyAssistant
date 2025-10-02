import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Link } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../FireBase'; // Adjust path as needed
import { useThemeColor } from '@/hooks/useThemeColor';

interface Forum {
  id: string;
  name: string;
  description: string;
}

export default function CommunityScreen() {
  const [forums, setForums] = useState<Forum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const cardBackgroundColor = useThemeColor({}, 'card');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');

  const fetchForums = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'forums'));
      const fetchedForums: Forum[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        description: doc.data().description,
      }));
      setForums(fetchedForums);
    } catch (err) {
      console.error('Error fetching forums:', err);
      setError('Error al cargar los foros.');
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchForums().finally(() => setLoading(false));
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchForums();
    setRefreshing(false);
  }, []);

  const renderItem = ({ item }: { item: Forum }) => (
    <Link href={`/community/${item.id}`} asChild>
      <TouchableOpacity style={[styles.forumItem, { backgroundColor: cardBackgroundColor, borderColor: borderColor }]}>
        <ThemedText type="subtitle">{item.name}</ThemedText>
        <ThemedText>{item.description}</ThemedText>
      </TouchableOpacity>
    </Link>
  );

  if (loading) {
    return (
      <ThemedView style={[styles.loadingContainer, { backgroundColor }]}>
        <ActivityIndicator size="large" color={tintColor} />
        <ThemedText>Cargando foros...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={[styles.loadingContainer, { backgroundColor }]}>
        <ThemedText type="subtitle">{error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ThemedText type="title" style={[styles.title, { color: tintColor }]}>Foros de la Comunidad</ThemedText>
      <FlatList
        data={forums}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[tintColor]} tintColor={tintColor} />
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 20,
  },
  forumItem: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
  },
});
