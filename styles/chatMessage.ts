import { StyleSheet } from 'react-native';

export const getChatMessageStyles = (theme: 'light' | 'dark') =>
  StyleSheet.create({
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: theme === 'dark' ? '#121212' : '#FFF5F8',
    },
    container: {
      flex: 1,
      backgroundColor: theme === 'dark' ? '#121212' : '#FFF5F8',
    },
    flex: {
      flex: 1,
    },
    messagesList: {
      padding: 16,
      paddingBottom: 10,
    },
    messageContainer: {
      marginBottom: 16,
    },
    currentUserContainer: {
      alignItems: 'flex-end',
    },
    otherUserContainer: {
      alignItems: 'flex-start',
    },
    messageBubble: {
      maxWidth: '80%',
      padding: 14,
      borderRadius: 20,
      shadowColor: theme === 'dark' ? '#000' : '#D6336C',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    currentUserBubble: {
      borderBottomRightRadius: 8,
      backgroundColor: theme === 'dark' ? '#B794F6' : '#FF6B9D',
    },
    otherUserBubble: {
      borderBottomLeftRadius: 8,
      backgroundColor: theme === 'dark' ? '#2A2335' : '#FFFFFF',
      borderWidth: 1,
      borderColor: theme === 'dark' ? '#3D3147' : '#FFE4ED',
    },
    messageText: {
      fontSize: 16,
      lineHeight: 22,
      color: theme === 'dark' ? '#FFFFFF' : '#1F2937',
    },
    currentUserMessageText: {
      color: '#FFFFFF',
    },
    otherUserMessageText: {
      color: theme === 'dark' ? '#E5E7EB' : '#374151',
    },
    messageFooter: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginTop: 6,
    },
    timestamp: {
      fontSize: 11,
      marginRight: 6,
    },
    currentUserTimestamp: {
      color: 'rgba(255,255,255,0.7)',
    },
    otherUserTimestamp: {
      color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
    },
    readStatus: {
      fontSize: 11,
      fontWeight: '600',
    },
    readStatusRead: {
      color: '#007AFF', // Azul para leído
    },
    readStatusUnread: {
      color: 'rgba(255,255,255,0.7)', // Gris claro para no leído
    },
    inputContainer: {
      flexDirection: 'row',
      padding: 16,
      borderTopWidth: 1,
      alignItems: 'flex-end',
      backgroundColor: theme === 'dark' ? '#2A2335' : '#FFFFFF',
      borderColor: theme === 'dark' ? '#3D3147' : '#FFE4ED',
    },
    textInput: {
      flex: 1,
      borderWidth: 1,
      borderRadius: 24,
      paddingHorizontal: 18,
      paddingVertical: 12,
      paddingTop: 12,
      marginRight: 12,
      maxHeight: 100,
      fontSize: 16,
      backgroundColor: theme === 'dark' ? '#1F1B24' : '#FFF5F8',
      borderColor: theme === 'dark' ? '#3D3147' : '#FFB6D9',
      color: theme === 'dark' ? '#E5E7EB' : '#1F2937',
    },
    sendButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme === 'dark' ? '#B794F6' : '#FF6B9D',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    sendButtonDisabled: {
      opacity: 0.5,
    },
    sendButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: 'bold',
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
    },
    emptyStateIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme === 'dark' ? '#2A2335' : '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
      borderWidth: 2,
      borderColor: theme === 'dark' ? '#3D3147' : '#FFE4ED',
    },
    emptyStateEmoji: {
      fontSize: 32,
    },
    emptyStateText: {
      fontSize: 18,
      marginBottom: 12,
      color: theme === 'dark' ? '#FFB6D9' : '#C62368',
      textAlign: 'center',
      fontWeight: '600',
    },
    emptyStateSubtext: {
      fontSize: 14,
      color: theme === 'dark' ? '#D4A5C0' : '#9E7B8E',
      textAlign: 'center',
      lineHeight: 20,
      paddingHorizontal: 20,
    },
    errorText: {
      fontSize: 16,
      marginBottom: 20,
      textAlign: 'center',
      color: theme === 'dark' ? '#FFB6D9' : '#C62368',
      fontWeight: '500',
    },
    button: {
      paddingHorizontal: 24,
      paddingVertical: 14,
      backgroundColor: theme === 'dark' ? '#B794F6' : '#FF6B9D',
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 6,
    },
    buttonText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 16,
      letterSpacing: 0.5,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 15,
      color: theme === 'dark' ? '#D4A5C0' : '#9E7B8E',
      fontWeight: '500',
    },
  });