import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { db } from '@/FireBase';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Stack, useRouter } from 'expo-router';
import { collection, doc, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

interface Chat {
  id: string;
  participants: string[];
  participantNames: { [key: string]: string };
  participantPhotos: { [key: string]: string };
  lastMessage: string;
  lastMessageTime: any;
  createdAt: any;
}

interface OtherUser {
  id: string;
  name: string;
  photoURL: string;
  profileData?: any;
}

export default function ChatsListScreen() {
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  const [chats, setChats] = useState<Chat[]>([]);
  const [otherUsers, setOtherUsers] = useState<{[key: string]: OtherUser}>({});
  const [loading, setLoading] = useState(true);
  const [unsubscribes, setUnsubscribes] = useState<(() => void)[]>([]);

  const backgroundColor = useThemeColor({}, 'background');
  const cardBackgroundColor = useThemeColor({}, 'card');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const defaultAvatar = require('@/assets/images/default-avatar.png');

  // Función para suscribirse a los cambios de perfil de un usuario
  const subscribeToUserProfile = (userId: string) => {
    const userRef = doc(db, 'users', userId);
    
    const unsubscribe = onSnapshot(userRef, (userDoc) => {
      if (userDoc.exists()) {
        const userData = userDoc.data();
        // CORRECCIÓN: Concatenar nombre y apellido
        const fullName = userData.nombre && userData.apellidos 
          ? `${userData.nombre} ${userData.apellidos}`
          : userData.nombre || 'Usuario';
        
        setOtherUsers(prev => ({
          ...prev,
          [userId]: {
            id: userId,
            name: fullName, // Usar nombre completo
            photoURL: userData.photoURL || '',
            profileData: userData
          }
        }));
      }
    });

    return unsubscribe;
  };

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', currentUser.uid),
      orderBy('lastMessageTime', 'desc')
    );

    const unsubscribeChats = onSnapshot(q, 
      (snapshot) => {
        const chatsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            participants: data.participants || [],
            participantNames: data.participantNames || {},
            participantPhotos: data.participantPhotos || {},
            lastMessage: data.lastMessage || 'Inicia la conversación',
            lastMessageTime: data.lastMessageTime || data.createdAt,
            createdAt: data.createdAt
          } as Chat;
        });
        
        const validChats = chatsData.filter(chat => chat.lastMessageTime !== null);
        setChats(validChats);
        setLoading(false);

        // Suscribirse a los perfiles de los otros usuarios
        const newUnsubscribes: (() => void)[] = [];
        validChats.forEach(chat => {
          const otherUserId = chat.participants?.find(id => id !== currentUser.uid);
          if (otherUserId && !otherUsers[otherUserId]) {
            const unsubscribe = subscribeToUserProfile(otherUserId);
            newUnsubscribes.push(unsubscribe);
          }
        });
        
        // Guardar las funciones de unsubscribe para limpiar después
        setUnsubscribes(prev => [...prev, ...newUnsubscribes]);
      }, 
      (error) => {
        console.error('Error loading chats:', error);
        setLoading(false);
      }
    );

    // Cleanup function
    return () => {
      unsubscribeChats();
      // Limpiar todas las suscripciones a perfiles de usuario
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [currentUser]);

  const getOtherParticipant = (chat: Chat) => {
    if (!currentUser) return { id: '', name: 'Usuario', photoURL: '' };
    
    const otherUserId = chat.participants?.find(id => id !== currentUser.uid);
    
    if (!otherUserId) {
      return { id: '', name: 'Usuario', photoURL: '' };
    }

    // PRIORIDAD: Usar datos actualizados del perfil en tiempo real
    const updatedUser = otherUsers[otherUserId];
    if (updatedUser) {
      return {
        id: otherUserId,
        name: updatedUser.name,
        photoURL: updatedUser.photoURL
      };
    }
    
    // FALLBACK: Usar datos guardados en el chat (pueden estar desactualizados)
    // CORRECCIÓN: Intentar construir nombre completo desde los datos del chat
    const chatName = chat.participantNames?.[otherUserId] || 'Usuario';
    
    return {
      id: otherUserId,
      name: chatName,
      photoURL: chat.participantPhotos?.[otherUserId] || ''
    };
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return 'Nuevo';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      
      if (isNaN(date.getTime())) {
        return 'Nuevo';
      }
      
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInHours = diffInMs / (1000 * 60 * 60);
      
      if (diffInHours < 1) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        if (diffInMinutes < 1) return 'Ahora';
        return `Hace ${diffInMinutes}m`;
      } else if (diffInHours < 24) {
        return `Hace ${Math.floor(diffInHours)}h`;
      } else if (diffInHours < 168) {
        return date.toLocaleDateString([], { weekday: 'short' });
      } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Nuevo';
    }
  };

  const renderChat = ({ item }: { item: Chat }) => {
    const otherUser = getOtherParticipant(item);
    
    if (!otherUser.id) return null;
    
    return (
      <TouchableOpacity 
        style={[styles.chatItem, { backgroundColor: cardBackgroundColor, borderColor }]}
        onPress={() => router.push({
          pathname: '/chat',
          params: { 
            chatId: item.id,
            otherUserId: otherUser.id, 
            otherUserName: encodeURIComponent(otherUser.name) 
          }
        })}
      >
        <Image
          source={otherUser.photoURL ? { uri: otherUser.photoURL } : defaultAvatar}
          style={styles.avatar}
          defaultSource={defaultAvatar}
        />
        <View style={styles.chatInfo}>
          <ThemedText style={styles.chatName}>{otherUser.name}</ThemedText>
          <ThemedText style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage || 'Inicia la conversación'}
          </ThemedText>
        </View>
        <ThemedText style={styles.time}>
          {formatTime(item.lastMessageTime)}
        </ThemedText>
      </TouchableOpacity>
    );
  };

  if (!currentUser) {
    return (
      <ThemedView style={[styles.centered, { backgroundColor }]}>
        <ThemedText style={styles.errorText}>Debes iniciar sesión para ver tus chats</ThemedText>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: tintColor }]} 
          onPress={() => router.push('../index')}
        >
          <ThemedText style={styles.buttonText}>Iniciar sesión</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  if (loading) {
    return (
      <ThemedView style={[styles.centered, { backgroundColor }]}>
        <ActivityIndicator size="large" color={tintColor} />
        <ThemedText style={styles.loadingText}>Cargando chats...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ 
        title: 'Mensajes',
        headerBackTitle: 'Inicio'
      }} />
      
      <FlatList
        data={chats}
        renderItem={renderChat}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyStateText}>
              No tienes conversaciones activas
            </ThemedText>
            <ThemedText style={styles.emptyStateSubtext}>
              Visita un perfil de usuario para iniciar un chat
            </ThemedText>
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    flex: 1,
  },
  listContent: {
    padding: 15,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    opacity: 0.7,
  },
  time: {
    fontSize: 12,
    opacity: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyStateText: {
    fontSize: 16,
    marginBottom: 8,
    opacity: 0.7,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    opacity: 0.5,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    opacity: 0.7,
  },
});