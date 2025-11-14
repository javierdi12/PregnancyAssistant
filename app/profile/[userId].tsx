import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { db } from '@/FireBase';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useUserProfileView } from '@/hooks/useUserProfileView';
import { getUserProfileStyles } from '@/styles/profile';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, RefreshControl, TouchableOpacity, View, useColorScheme } from 'react-native';

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
  const { currentUser } = useCurrentUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const styles = getUserProfileStyles(isDarkMode);
  const tintColor = isDarkMode ? '#B794F6' : '#FF6B9D';
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

  const handleSendMessage = async () => {
  if (!currentUser) {
    Alert.alert(
      'Inicia sesión',
      'Debes iniciar sesión para enviar mensajes',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Iniciar sesión', onPress: () => router.push('../index') }
      ]
    );
    return;
  }

  if (!userId || typeof userId !== 'string') {
    Alert.alert('Error', 'No se puede iniciar el chat en este momento');
    return;
  }

  // Evitar enviar mensaje a uno mismo
  if (currentUser.uid === userId) {
    Alert.alert('Info', 'No puedes enviarte mensajes a ti mismo');
    return;
  }

  try {
    // Función helper para obtener perfil de usuario
    const getUserProfile = async (userId: string) => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        return userDoc.exists() ? userDoc.data() : null;
      } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
    };

    // Obtener perfiles de ambos usuarios
    const currentUserProfile = await getUserProfile(currentUser.uid);
    const targetUserProfile = await getUserProfile(userId);

    // Determinar nombres con fallbacks
    const currentUserName = currentUserProfile?.nombre || currentUser.displayName || currentUser.email?.split('@')[0] || 'Usuario';
    const targetUserName = targetUserProfile?.nombre || user?.nombre || 'Usuario';

    // Obtener fotos de perfil con fallbacks
    const currentUserPhoto = currentUser.photoURL || currentUserProfile?.photoURL || '';
    const targetUserPhoto = user?.photoURL || targetUserProfile?.photoURL || '';

    // Crear o obtener el chat entre los dos usuarios
    const chatId = [currentUser.uid, userId].sort().join('_');
    const chatRef = doc(db, 'chats', chatId);
    
    const chatSnap = await getDoc(chatRef);
    
    if (!chatSnap.exists()) {
      // Primero crear el chat
      await setDoc(chatRef, {
        participants: [currentUser.uid, userId],
        participantNames: {
          [currentUser.uid]: currentUserName,
          [userId]: targetUserName
        },
        lastMessageTime: serverTimestamp(),
        createdAt: serverTimestamp(),
        participantPhotos: {
          [currentUser.uid]: currentUserPhoto,
          [userId]: targetUserPhoto
        }
      });

      // Luego agregar el mensaje inicial
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      await addDoc(messagesRef, {
        senderId: currentUser.uid,
        timestamp: serverTimestamp(),
        read: false
      });
    }
    
    // Navegar a la pantalla de chat
    router.push({
      pathname: '/chat',
      params: { 
        chatId: chatId,
        otherUserId: userId, 
        otherUserName: encodeURIComponent(targetUserName) 
      }
    });
    
  } catch (error) {
    console.error('Error creating chat:', error);
    Alert.alert('Error', 'No se pudo iniciar el chat. Intenta nuevamente.');
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
      style={styles.postCard}
      onPress={() => router.push(`/community/post/${item.id}`)}
      activeOpacity={0.7}
    >
      <ThemedText style={styles.postText}>{item.text}</ThemedText>
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
      )}
      <View style={styles.postActions}>
        <View style={styles.postAction}>
          <ThemedText>❤️</ThemedText>
          <ThemedText style={styles.postActionText}>{item.likesCount}</ThemedText>
        </View>
        <View style={styles.postAction}>
          <ThemedText>💬</ThemedText>
          <ThemedText style={styles.postActionText}>{item.commentsCount}</ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={tintColor} />
        <ThemedText style={styles.loadingText}>Cargando perfil...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <Stack.Screen options={{ title: 'Error' }} />
        <ThemedText type="subtitle">{error}</ThemedText>
      </ThemedView>
    );
  }

  const isCurrentUserProfile = currentUser?.uid === userId;

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: `Perfil de ${user?.nombre || 'Usuario'}` }} />
      
      <FlatList
        ListHeaderComponent={
          <>
            <View style={styles.headerCard}>
              <Image
                source={{ uri: user?.photoURL || defaultAvatar }}
                style={styles.avatar}
              />
              <ThemedText style={styles.name}>
                {user?.nombre} {user?.apellidos}
              </ThemedText>
              
              {user?.provincia && (
                <ThemedText style={styles.location}>
                  📍 {user.distrito}, {user.canton}, {user.provincia}
                </ThemedText>
              )}
              
              {/* Botón de enviar mensaje dentro del perfil */}
              {!isCurrentUserProfile && (
                <TouchableOpacity 
                  style={styles.inlineMessageButton}
                  onPress={handleSendMessage}
                  activeOpacity={0.8}
                >
                  <ThemedText style={styles.inlineMessageButtonText}>
                    💬 Enviar Mensaje
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
            
            {posts.length > 0 && (
              <View style={styles.postsSection}>
                <ThemedText style={styles.postsSectionTitle}>
                  📝 Publicaciones
                </ThemedText>
              </View>
            )}
          </>
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
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyStateText}>
                😊{' \n\n'}Este usuario aún no ha realizado ninguna publicación.
              </ThemedText>
            </View>
          ) : null
        }
      />
      {loadingPosts && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <ThemedText style={styles.loadingText}>Cargando publicaciones...</ThemedText>
        </View>
      )}
    </ThemedView>
  );
}