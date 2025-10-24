import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { db } from '@/FireBase';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useUserProfileView } from '@/hooks/useUserProfileView';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';

interface Post {
  id: string;
  userId: string;
  text: string;
  imageUrl?: string;
  createdAt: any;
  likesCount: number;
  commentsCount: number;
}

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams();
  const router = useRouter();
  const { user, loading, error } = useUserProfileView(userId);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const cardBackgroundColor = useThemeColor({}, 'card');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const defaultAvatar = Image.resolveAssetSource(require('@/assets/images/default-avatar.png')).uri;

  const fetchUserPosts = async () => {
    if (!userId || typeof userId !== 'string') return;
    
    try {
      // obtain all posts from the user
      const q = query(
        collection(db, 'posts'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const fetchedPosts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Post));
      
      // then sort by createdAt descending
      fetchedPosts.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
      setPosts(fetchedPosts);
    } catch (err) {
      console.error('Error fetching user posts:', err);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchUserPosts();
  }, [userId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserPosts();
    setRefreshing(false);
  };

  const renderPost = ({ item }: { item: Post }) => (
    <TouchableOpacity 
      style={[styles.postCard, { backgroundColor: cardBackgroundColor, borderColor: borderColor }]}
      onPress={() => router.push(`/community/post/${item.id}`)}
    >
      <ThemedText style={styles.postText}>{item.text}</ThemedText>
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
      )}
      <View style={styles.postActions}>
        <ThemedText>❤️ {item.likesCount}</ThemedText>
        <ThemedText>💬 {item.commentsCount}</ThemedText>
      </View>
    </TouchableOpacity>
  );

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
      <FlatList
        ListHeaderComponent={
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
        }
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[tintColor]}
            tintColor={tintColor}
          />
        }
        ListEmptyComponent={
          !loadingPosts ? (
            <View style={[styles.emptyState, { backgroundColor: cardBackgroundColor }]}>
              <ThemedText style={styles.emptyStateText}>
                Este usuario aún no ha realizado ninguna publicación.
              </ThemedText>
            </View>
          ) : null
        }
      />
      {loadingPosts && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
          <ThemedText>Cargando publicaciones...</ThemedText>
        </View>
      )}
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
    marginBottom: 20,
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
  listContent: {
    paddingHorizontal: 20,
  },
  postCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
  },
  postText: {
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 22,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 10,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  emptyState: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
});
