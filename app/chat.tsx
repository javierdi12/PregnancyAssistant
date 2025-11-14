import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { db } from '@/FireBase';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useUserProfileView } from '@/hooks/useUserProfileView';
import { NotificationMessageService } from '@/services/notificationMessageService';
import { getChatMessageStyles } from '@/styles/chatMessage';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: any;
  read: boolean;
}

export default function ChatScreen() {
  const { chatId, otherUserId, otherUserName } = useLocalSearchParams();
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  const colorScheme = useColorScheme();
  
  const { user: otherUserProfile, loading: loadingProfile } = useUserProfileView(
    otherUserId && typeof otherUserId === 'string' ? otherUserId : undefined
  );

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Use the system color scheme
  const theme = colorScheme || 'light';
  const styles = getChatMessageStyles(theme);
  const tintColor = useThemeColor({}, 'tint');

  useEffect(() => {
    if (!chatId || typeof chatId !== 'string' || !currentUser) {
      setLoading(false);
      return;
    }

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Message));
      
      setMessages(messagesData);
      setLoading(false);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, (error) => {
      console.error('Error en chat:', error);
      setLoading(false);
      Alert.alert('Error', 'No se pudo cargar el chat');
    });

    return () => unsubscribe();
  }, [chatId, currentUser]);

  // Function to get the current user's name from Firestore
  const getCurrentUserName = async (): Promise<string> => {
    if (!currentUser) return 'Alguien';
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        // First try with first name + last name
        if (userData.nombre && userData.apellidos) {
          return `${userData.nombre} ${userData.apellidos}`.trim();
        } else if (userData.nombre) {
          return userData.nombre;
        } else if (userData.display) {
          return userData.display;
        }
      }
    } catch (error) {
      console.error('Error obteniendo nombre del usuario:', error);
    }
    
    // Fallback to email or default name
    return currentUser.email ? currentUser.email.split('@')[0] : 'Alguien';
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatId || typeof chatId !== 'string' || !currentUser) return;

    setSending(true);
    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      
      await addDoc(messagesRef, {
        text: newMessage.trim(),
        senderId: currentUser.uid,
        timestamp: serverTimestamp(),
        read: false
      });

      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        lastMessage: newMessage.trim(),
        lastMessageTime: serverTimestamp()
      });

      
      if (otherUserId && typeof otherUserId === 'string') {
        
        const senderName = await getCurrentUserName();
        console.log(`📤 Enviando notificación como: ${senderName}`);
        
        NotificationMessageService.sendNotificationToUser(
          otherUserId,
          newMessage.trim(),
          currentUser.uid, 
          chatId
        ).catch(error => {
          console.error('Error enviando notificación:', error);
        });
      }

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'No se pudo enviar el mensaje');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp?.toDate) return 'Ahora';
    
    const date = timestamp.toDate();
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.senderId === currentUser?.uid;
    
    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
        ]}>
          <ThemedText style={[
            styles.messageText,
            isCurrentUser ? styles.currentUserMessageText : styles.otherUserMessageText
          ]}>
            {item.text}
          </ThemedText>
          <ThemedText style={[
            styles.timestamp,
            isCurrentUser ? styles.currentUserTimestamp : styles.otherUserTimestamp
          ]}>
            {formatTime(item.timestamp)}
          </ThemedText>
        </View>
      </View>
    );
  };

  const displayName = otherUserProfile?.nombre 
    ? `${otherUserProfile.nombre} ${otherUserProfile.apellidos || ''}`.trim()
    : (otherUserName && typeof otherUserName === 'string' 
        ? decodeURIComponent(otherUserName) 
        : 'Usuario');

  if (!currentUser) {
    return (
      <ThemedView style={styles.centered}>
        <View style={styles.emptyStateIcon}>
          <ThemedText style={styles.emptyStateEmoji}>💬</ThemedText>
        </View>
        <ThemedText style={styles.errorText}>Debes iniciar sesión para usar el chat</ThemedText>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => router.push('../index')}
        >
          <ThemedText style={styles.buttonText}>Iniciar sesión</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  if (loading || loadingProfile) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={tintColor} />
        <ThemedText style={styles.loadingText}>Cargando chat...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ 
        title: displayName,
        headerBackTitle: 'Chats',
        headerTintColor: theme === 'dark' ? '#FFB6D9' : '#D6336C',
      }} />
      
      <KeyboardAvoidingView 
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <ThemedText style={styles.emptyStateEmoji}>💭</ThemedText>
              </View>
              <ThemedText style={styles.emptyStateText}>
                Inicia la conversación con {displayName}
              </ThemedText>
              <ThemedText style={styles.emptyStateSubtext}>
                Escribe un mensaje para comenzar el chat y compartir experiencias
              </ThemedText>
            </View>
          }
        />
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder={`Escribe un mensaje a ${displayName}...`}
            placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
            multiline
            maxLength={500}
            editable={!sending}
          />
          <TouchableOpacity 
            style={[
              styles.sendButton,
              (!newMessage.trim() || sending) && styles.sendButtonDisabled
            ]}
            onPress={sendMessage}
            disabled={!newMessage.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <ThemedText style={styles.sendButtonText}>➤</ThemedText>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}