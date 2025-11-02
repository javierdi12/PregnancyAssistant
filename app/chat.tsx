import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { db } from '@/FireBase';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useUserProfileView } from '@/hooks/useUserProfileView'; // AÑADIR ESTA IMPORTACIÓN
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
    addDoc,
    collection,
    doc,
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
    StyleSheet,
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
  
  // AÑADIR: Obtener el perfil actualizado del otro usuario
  const { user: otherUserProfile, loading: loadingProfile } = useUserProfileView(
    otherUserId && typeof otherUserId === 'string' ? otherUserId : undefined
  );

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const backgroundColor = useThemeColor({}, 'background');
  const cardBackgroundColor = useThemeColor({}, 'card');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');

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
          { backgroundColor: isCurrentUser ? tintColor : cardBackgroundColor }
        ]}>
          <ThemedText style={[
            styles.messageText,
            { color: isCurrentUser ? 'white' : undefined }
          ]}>
            {item.text}
          </ThemedText>
          <ThemedText style={[
            styles.timestamp,
            { color: isCurrentUser ? 'rgba(255,255,255,0.7)' : '#666' }
          ]}>
            {formatTime(item.timestamp)}
          </ThemedText>
        </View>
      </View>
    );
  };

  // AÑADIR: Usar el nombre completo del perfil actualizado
  const displayName = otherUserProfile?.nombre 
    ? `${otherUserProfile.nombre} ${otherUserProfile.apellidos || ''}`.trim()
    : (otherUserName && typeof otherUserName === 'string' 
        ? decodeURIComponent(otherUserName) 
        : 'Usuario');

  if (!currentUser) {
    return (
      <ThemedView style={[styles.centered, { backgroundColor }]}>
        <ThemedText style={styles.errorText}>Debes iniciar sesión para usar el chat</ThemedText>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: tintColor }]} 
          onPress={() => router.push('../index')}
        >
          <ThemedText style={styles.buttonText}>Iniciar sesión</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  // AÑADIR: Incluir loadingProfile en la condición de carga
  if (loading || loadingProfile) {
    return (
      <ThemedView style={[styles.centered, { backgroundColor }]}>
        <ActivityIndicator size="large" color={tintColor} />
        <ThemedText style={styles.loadingText}>Cargando chat...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ 
        title: displayName, // CAMBIAR: Usar displayName en lugar de decodedUserName
        headerBackTitle: 'Chats'
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
              <ThemedText style={styles.emptyStateText}>
                💬 Inicia la conversación con {displayName} {/* CAMBIAR: Usar displayName */}
              </ThemedText>
              <ThemedText style={styles.emptyStateSubtext}>
                Escribe un mensaje para comenzar el chat
              </ThemedText>
            </View>
          }
        />
        
        <View style={[styles.inputContainer, { borderColor, backgroundColor: cardBackgroundColor }]}>
          <TextInput
            style={[styles.textInput, { backgroundColor: backgroundColor, borderColor }]}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder={`Escribe un mensaje a ${displayName}...`} 
            placeholderTextColor="#666"
            multiline
            maxLength={500}
            editable={!sending}
          />
          <TouchableOpacity 
            style={[
              styles.sendButton, 
              { backgroundColor: tintColor },
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
  flex: {
    flex: 1,
  },
  messagesList: {
    padding: 15,
    paddingBottom: 10,
  },
  messageContainer: {
    marginBottom: 12,
  },
  currentUserContainer: {
    alignItems: 'flex-end',
  },
  otherUserContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  currentUserBubble: {
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingTop: 10,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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