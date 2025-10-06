import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useLocalSearchParams, Stack, Link, useRouter } from 'expo-router';
import { collection, query, where, orderBy, getDocs, Timestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../../FireBase'; // Adjust path as needed
import { useThemeColor } from '@/hooks/useThemeColor';
import { Feather } from '@expo/vector-icons';

interface Post {
  id: string;
  userId: string;
  username?: string; // Optional now, will be added after fetching
  text: string;
  imageUrl?: string;
  createdAt: Timestamp;
  likesCount: number;
  commentsCount: number;
}

export default function ForumDetailScreen() {
  const { forumId } = useLocalSearchParams();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [forumName, setForumName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const cardBackgroundColor = useThemeColor({}, 'card');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');

  const fetchForumAndPosts = async () => {
    if (!forumId || typeof forumId !== 'string') {
      setError('ID de foro no proporcionado.');
      return;
    }
    try {
      // Fetch forum name
      const forumRef = doc(db, 'forums', forumId);
      const forumSnap = await getDoc(forumRef);
      if (forumSnap.exists()) {
        setForumName(forumSnap.data().name);
      }

      // Fetch posts
      const q = query(
        collection(db, 'posts'),
        where('forumId', '==', forumId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const fetchedPosts: Post[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Post));

      // Get user data
      const userIds = [...new Set(fetchedPosts.map(p => p.userId))];
      if (userIds.length > 0) {
        const usersQuery = query(collection(db, 'users'), where('__name__', 'in', userIds));
        const usersSnapshot = await getDocs(usersQuery);
        const usersData = Object.fromEntries(usersSnapshot.docs.map(doc => [doc.id, doc.data()]));

        fetchedPosts.forEach(post => {
          post.username = usersData[post.userId]?.displayName || 'Usuario Anónimo';
        });
      }

      setPosts(fetchedPosts);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error al cargar los datos.');
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchForumAndPosts().finally(() => setLoading(false));
  }, [forumId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchForumAndPosts();
    setRefreshing(false);
  }, [forumId]);

  const renderPost = ({ item }: { item: Post }) => (
    <View style={[styles.postItem, { backgroundColor: cardBackgroundColor, borderColor: borderColor }]}>
      <TouchableOpacity onPress={() => router.push(`/profile/${item.userId}`)}>
        <ThemedText type="subtitle">{item.username}</ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => router.push(`/community/post/${item.id}`)}>
        <ThemedText style={{marginTop: 8}}>{item.text}</ThemedText>
        {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.postImage} />}
      </TouchableOpacity>

      <View style={styles.postActions}>
        <ThemedText>❤️ {item.likesCount}</ThemedText>
        <ThemedText>💬 {item.commentsCount}</ThemedText>
      </View>
    </View>
  );

  if (loading) {
    return (
      <ThemedView style={[styles.loadingContainer, { backgroundColor }]}>
        <ActivityIndicator size="large" color={tintColor} />
        <ThemedText>Cargando publicaciones...</ThemedText>
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
      <Stack.Screen
        options={{
          title: forumName || 'Foro',
          headerRight: () => (
            <Link href={{ pathname: '/community/create-post', params: { forumId: forumId } }} asChild>
              <TouchableOpacity style={{ marginRight: 15 }}>
                <Feather name="plus-square" size={24} color={tintColor} />
              </TouchableOpacity>
            </Link>
          ),
        }}
      />
      <ThemedText type="title" style={[styles.title, { color: tintColor }]}>{forumName || 'Posts en el Foro'}</ThemedText>
      <FlatList
        data={posts}
        renderItem={renderPost}
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
  postItem: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
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
  },
});