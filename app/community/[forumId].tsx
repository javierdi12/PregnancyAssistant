import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Feather } from '@expo/vector-icons';
import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { collection, doc, getDoc, getDocs, orderBy, query, Timestamp, where } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, RefreshControl, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';
import { db } from '../../FireBase'; // Adjust path as needed

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

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  
  // Colores consistentes con el index
  const backgroundColor = isDarkMode ? "#1A1625" : "#FFF5F8";
  const cardBackgroundColor = isDarkMode ? "#2A2335" : "#FFFFFF";
  const tintColor = isDarkMode ? "#FFB6D9" : "#D6336C";
  const borderColor = isDarkMode ? "#3D3147" : "#FFE4ED";
  const textColor = isDarkMode ? "#D4A5C0" : "#6B5B62";

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

        console.log('Users Data:', usersData);

        fetchedPosts.forEach(post => {
          const userData = usersData[post.userId];
          if (userData?.nombre && userData?.apellidos) {
            post.username = `${userData.nombre} ${userData.apellidos}`;
          } else {
            post.username = userData?.displayName || 'Usuario Anónimo';
          }
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
    <View style={[styles.postItem, { 
      backgroundColor: cardBackgroundColor, 
      borderColor: borderColor,
      shadowColor: isDarkMode ? "#000" : "#D6336C",
      shadowOpacity: isDarkMode ? 0.3 : 0.12,
    }]}>
      <TouchableOpacity onPress={() => router.push(`/profile/${item.userId}`)}>
        <ThemedText style={{ 
          fontSize: 16, 
          fontWeight: '600',
          color: tintColor
        }}>
          👤 {item.username}
        </ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => router.push(`/community/post/${item.id}`)}>
        <ThemedText style={[styles.postText, { color: textColor }]}>
          {item.text}
        </ThemedText>
        {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.postImage} />}
      </TouchableOpacity>

      <View style={[styles.postActions, { borderTopColor: borderColor }]}>
        <ThemedText style={{ fontSize: 16, color: textColor }}>❤️ {item.likesCount}</ThemedText>
        <ThemedText style={{ fontSize: 16, color: textColor }}>💬 {item.commentsCount}</ThemedText>
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
      <View style={[styles.welcomeCard, { backgroundColor: cardBackgroundColor, borderColor, shadowColor: isDarkMode ? "#000" : "#D6336C" }]}>
        <ThemedText style={[styles.welcomeText, { color: textColor }]}>
          Aquí encontrarás todas las publicaciones relacionadas con {forumName.toLowerCase() || 'este tema'}. 
          ¡Participa y comparte tus experiencias!
        </ThemedText>
      </View>
      <ThemedText type="title" style={[styles.title, { color: tintColor }]}>✨ {forumName || 'Posts en el Foro'} ✨</ThemedText>
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
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: 16,
    letterSpacing: 0.5,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  postItem: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  postText: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 12,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  welcomeCard: {
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
  },
  welcomeText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});