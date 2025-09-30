import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, db } from '../../FireBase';

const Community = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [newPostText, setNewPostText] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const isMounted = useRef(true);

  // Escuchar cambios en la autenticación
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
      if (isMounted.current) {
        if (currentUser) {
          setUser(currentUser);
        } else {
          // Si no hay usuario, redirigir al login
          router.replace('../index');
        }
      }
    });

    return () => {
      isMounted.current = false;
      unsubscribeAuth();
    };
  }, []);

  // Cargar publicaciones en tiempo real
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'communityPosts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      if (isMounted.current) {
        setPosts(postsData);
        setIsLoadingPosts(false);
      }
    }, (error) => {
      console.error('Error al cargar publicaciones:', error);
      Alert.alert('Error', 'No se pudieron cargar las publicaciones');
      setIsLoadingPosts(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddPost = async () => {
    if (!newPostText.trim()) {
      Alert.alert('Oops', 'Escribe algo antes de publicar');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'communityPosts'), {
        text: newPostText,
        author: {
          uid: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'Mamá',
        },
        likes: [],
        comments: [],
        createdAt: serverTimestamp(),
      });
      setNewPostText('');
    } catch (error) {
      console.error('Error al publicar:', error);
      Alert.alert('Error', 'No se pudo publicar tu mensaje');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    const postRef = doc(db, 'communityPosts', postId);
    const post = posts.find(p => p.id === postId);
    const isLiked = post?.likes?.includes(user.uid);

    if (isLiked) {
      Alert.alert('Info', 'Quitar like aún no implementado (puedes usar arrayRemove)');
      return;
    }

    try {
      await updateDoc(postRef, {
        likes: arrayUnion(user.uid),
      });
    } catch (error) {
      console.error('Error al dar like:', error);
      Alert.alert('Error', 'No se pudo dar like');
    }
  };

  const PostItem = ({ item }: { item: any }) => {
    const likeCount = item.likes?.length || 0;
    const isLiked = item.likes?.includes(user?.uid);
    const authorName = item.author?.name || 'Mamá anónima';
    const timeAgo = item.createdAt?.toDate?.()?.toLocaleDateString('es-ES') || 'Hoy';

    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {authorName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.authorName}>{authorName}</Text>
          <Text style={styles.timeAgo}>{timeAgo}</Text>
        </View>

        <Text style={styles.postText}>{item.text}</Text>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(item.id)}>
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={20}
              color={isLiked ? '#FF69B4' : '#555'}
            />
            <Text style={styles.actionText}>{likeCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={20} color="#555" />
            <Text style={styles.actionText}>{item.comments?.length || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="help-circle-outline" size={20} color="#555" />
            <Text style={styles.actionText}>Consejo</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isLoadingPosts) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#FF69B4" />
        <Text style={styles.loadingText}>Cargando comunidad...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Comunidad de Mamás</Text>
      </View>

      {/* Formulario para nueva publicación */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Comparte tu experiencia, dudas o consejos..."
          placeholderTextColor="#999"
          multiline
          value={newPostText}
          onChangeText={setNewPostText}
        />
        <TouchableOpacity
          style={[styles.postButton, loading && styles.postButtonDisabled]}
          onPress={handleAddPost}
          disabled={loading}
        >
          <Text style={styles.postButtonText}>
            {loading ? 'Publicando...' : 'Publicar'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de publicaciones */}
      <FlatList
        data={posts}
        renderItem={({ item }) => <PostItem item={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.feed}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>¡Sé la primera en publicar! 👶</Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9FB',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFB6C1',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#8B0000',
  },
  inputContainer: {
    padding: 16,
    backgroundColor: '#FFF',
    marginHorizontal: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  textInput: {
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    color: '#333',
  },
  postButton: {
    backgroundColor: '#ADD8E6',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  postButtonDisabled: {
    opacity: 0.6,
  },
  postButtonText: {
    color: '#000',
    fontWeight: '600',
  },
  feed: {
    padding: 8,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFB6C1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#8B0000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  authorName: {
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  timeAgo: {
    color: '#888',
    fontSize: 12,
  },
  postText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 4,
    color: '#555',
    fontSize: 14,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 16,
    color: '#888',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default Community;