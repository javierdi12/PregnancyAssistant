import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { db } from '@/FireBase';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useThemeColor } from '@/hooks/useThemeColor';
import { getChatsListStyles } from '@/styles/chatStyle';
import { Stack, useRouter } from 'expo-router';
import { collection, doc, getDoc, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
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
  isOnline?: boolean;
  lastSeen?: any;
}

export default function ChatsListScreen() {
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  const colorScheme = useColorScheme();
  const [chats, setChats] = useState<Chat[]>([]);
  const [otherUsers, setOtherUsers] = useState<{[key: string]: OtherUser}>({});
  const [loading, setLoading] = useState(true);
  const [unsubscribes, setUnsubscribes] = useState<(() => void)[]>([]);
  
  const tintColor = useThemeColor({}, 'tint');
  const defaultAvatar = require('@/assets/images/default-avatar.png');

  // Usar el color scheme del sistema
  const theme = colorScheme || 'light';
  const styles = getChatsListStyles(theme);

  // Function to check if user is online
  const checkUserOnlineStatus = async (userId: string): Promise<boolean> => {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const lastSeen = userData.lastSeen;
        
        if (lastSeen) {
          const lastSeenDate = lastSeen.toDate ? lastSeen.toDate() : new Date(lastSeen);
          const now = new Date();
          const diffInMinutes = (now.getTime() - lastSeenDate.getTime()) / (1000 * 60);
          
          // Considerar online si se conectó en los últimos 5 minutos
          return diffInMinutes < 5;
        }
      }
      return false;
    } catch (error) {
      console.error('Error checking online status:', error);
      return false;
    }
  };

  // Function to subscribe to changes in a user's profile
  const subscribeToUserProfile = (userId: string) => {
    const userRef = doc(db, 'users', userId);
    
    const unsubscribe = onSnapshot(userRef, async (userDoc) => {
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const fullName = userData.nombre && userData.apellidos 
          ? `${userData.nombre} ${userData.apellidos}`
          : userData.nombre || 'Usuario';
        
        // Verificar estado online
        const isOnline = await checkUserOnlineStatus(userId);
        
        setOtherUsers(prev => ({
          ...prev,
          [userId]: {
            id: userId,
            name: fullName,
            photoURL: userData.photoURL || '',
            profileData: userData,
            isOnline,
            lastSeen: userData.lastSeen
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
      async (snapshot) => {
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

        // Subscribe to other users' profiles
        const newUnsubscribes: (() => void)[] = [];
        for (const chat of validChats) {
          const otherUserId = chat.participants?.find(id => id !== currentUser.uid);
          if (otherUserId && !otherUsers[otherUserId]) {
            const unsubscribe = subscribeToUserProfile(otherUserId);
            newUnsubscribes.push(unsubscribe);
          }
        }
        
        setUnsubscribes(prev => [...prev, ...newUnsubscribes]);
      }, 
      (error) => {
        console.error('Error loading chats:', error);
        setLoading(false);
      }
    );

    return () => {
      unsubscribeChats();
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [currentUser]);

  const getOtherParticipant = (chat: Chat) => {
    if (!currentUser) return { id: '', name: 'Usuario', photoURL: '', isOnline: false };
    
    const otherUserId = chat.participants?.find(id => id !== currentUser.uid);
    
    if (!otherUserId) {
      return { id: '', name: 'Usuario', photoURL: '', isOnline: false };
    }

    const updatedUser = otherUsers[otherUserId];
    if (updatedUser) {
      return {
        id: otherUserId,
        name: updatedUser.name,
        photoURL: updatedUser.photoURL,
        isOnline: updatedUser.isOnline || false
      };
    }
    
    const chatName = chat.participantNames?.[otherUserId] || 'Usuario';
    
    return {
      id: otherUserId,
      name: chatName,
      photoURL: chat.participantPhotos?.[otherUserId] || '',
      isOnline: false
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
        style={styles.chatItem}
        onPress={() => router.push({
          pathname: '/chat',
          params: { 
            chatId: item.id,
            otherUserId: otherUser.id, 
            otherUserName: encodeURIComponent(otherUser.name) 
          }
        })}
      >
        <View style={styles.avatarContainer}>
          <Image
            source={otherUser.photoURL ? { uri: otherUser.photoURL } : defaultAvatar}
            style={styles.avatar}
            defaultSource={defaultAvatar}
          />
          <View style={otherUser.isOnline ? styles.onlineIndicator : styles.offlineIndicator} />
        </View>
        <View style={styles.chatInfo}>
          <ThemedText style={styles.chatName}>{otherUser.name}</ThemedText>
          <ThemedText style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage || 'Inicia la conversación'}
          </ThemedText>
        </View>
        <View style={styles.timeContainer}>
          <ThemedText style={styles.time}>
            {formatTime(item.lastMessageTime)}
          </ThemedText>
          {item.lastMessage && (
            <View style={styles.messageIndicator} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (!currentUser) {
    return (
      <ThemedView style={styles.centered}>
        <View style={styles.pregnancyIcon}>
          <ThemedText style={styles.pregnancyIconText}>🤰</ThemedText>
        </View>
        <ThemedText style={styles.errorText}>Debes iniciar sesión para ver tus chats</ThemedText>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => router.push('../index')}
        >
          <ThemedText style={styles.buttonText}>Iniciar sesión</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
          <ThemedText style={styles.loadingText}>Cargando tus conversaciones...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Mensajes',
        headerBackTitle: 'Inicio',
        headerTintColor: theme === 'dark' ? '#FFB6D9' : '#D6336C',
      }} />
      
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Tus Conversaciones</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Conecta con tu comunidad de apoyo
        </ThemedText>
      </View>
      
      <FlatList
        data={chats}
        renderItem={renderChat}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <ThemedText style={styles.emptyStateEmoji}>💬</ThemedText>
            </View>
            <ThemedText style={styles.emptyStateText}>
              No tienes conversaciones activas
            </ThemedText>
            <ThemedText style={styles.emptyStateSubtext}>
              Visita un perfil de usuario para iniciar un chat y compartir experiencias
            </ThemedText>
          </View>
        }
      />
    </ThemedView>
  );
}