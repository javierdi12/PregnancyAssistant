import { db } from '@/FireBase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Platform } from 'react-native';

export interface NotificationMessageData {
  title: string;
  body: string;
  data?: any;
  sound?: boolean;
}

// CLASE PARA NOTIFICACIONES PUSH (SOLO PUSH)
export class NotificationMessageService {
  // Verificar si estamos en móvil
  static isMobile(): boolean {
    return Platform.OS !== 'web';
  }

  // Obtener el token push de un usuario desde Firestore
  static async getUserPushToken(userId: string): Promise<string | null> {
    if (!this.isMobile()) {
      console.log('🔕 Web: Notificaciones deshabilitadas');
      return null;
    }
    
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.expoPushToken || null;
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting user push token:', error);
      return null;
    }
  }

  // Guardar token push del usuario
  static async saveUserPushToken(userId: string, token: string): Promise<void> {
    if (!this.isMobile()) return;
    
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, { 
        expoPushToken: token,
        pushTokenUpdatedAt: new Date() 
      }, { merge: true });
      console.log('✅ Push token guardado para usuario:', userId);
    } catch (error) {
      console.error('❌ Error saving push token:', error);
      throw error;
    }
  }

  // Enviar notificación push
  static async sendPushNotification(
    expoPushToken: string, 
    message: string, 
    senderName: string,
    chatId?: string,
    otherUserId?: string
  ): Promise<void> {
    if (!this.isMobile()) {
      console.log('🔕 Notificaciones push deshabilitadas en web');
      return;
    }

    if (!expoPushToken) {
      console.log('❌ No hay token push disponible');
      return;
    }

    const messageBody = {
      to: expoPushToken,
      sound: 'default' as const,
      title: `💬 Nuevo mensaje de ${senderName}`,
      body: message.length > 100 ? message.substring(0, 100) + '...' : message,
      data: { 
        chatId, 
        otherUserId,
        type: 'new_message',
        senderName,
        timestamp: new Date().toISOString()
      },
    };

    try {
      console.log('📤 Enviando notificación push...');
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('✅ Notificación push enviada exitosamente');
    } catch (error) {
      console.error('❌ Error sending push notification:', error);
      throw error;
    }
  }

  // Enviar notificación a un usuario específico (SOLO PUSH)
  static async sendNotificationToUser(
    userId: string, 
    message: string, 
    senderName: string,
    chatId?: string
  ): Promise<void> {
    if (!this.isMobile()) {
      console.log('🔕 Notificaciones deshabilitadas en web');
      return;
    }

    try {
      console.log(`📨 Intentando enviar notificación PUSH a usuario: ${userId}`);
      const userToken = await this.getUserPushToken(userId);
      
      if (userToken) {
        await this.sendPushNotification(userToken, message, senderName, chatId, userId);
        console.log('✅ Notificación PUSH enviada exitosamente a:', userId);
      } else {
        console.log('❌ Usuario no tiene token push registrado. NO se enviará notificación:', userId);
        // No se envía nada si no hay token
      }
    } catch (error) {
      console.error('❌ Error sending notification to user:', error);
      // No se envía nada si hay error
    }
  }

  // Verificar si un usuario tiene token push
  static async hasPushToken(userId: string): Promise<boolean> {
    if (!this.isMobile()) return false;
    const token = await this.getUserPushToken(userId);
    return token !== null;
  }
}