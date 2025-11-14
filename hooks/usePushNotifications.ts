import { NotificationMessageService } from '@/services/notificationMessageService';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { useCurrentUser } from './useCurrentUser';


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const usePushNotifications = () => {
  const { currentUser } = useCurrentUser();
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const [notification, setNotification] = useState<Notifications.Notification>();
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    
    if (Platform.OS === 'web') {
      console.log('🔕 Notificaciones deshabilitadas en web');
      return;
    }

    console.log('🔔 Inicializando notificaciones push...');
    
    registerForPushNotificationsAsync().then(token => {
      if (token && currentUser) {
        setExpoPushToken(token);
         // Save the token using the new service
        NotificationMessageService.saveUserPushToken(currentUser.uid, token)
          .then(() => console.log('✅ Token guardado exitosamente'))
          .catch(error => console.error('❌ Error guardando token:', error));
      }
    });

    // Listen for incoming notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('📩 Notificación recibida:', notification);
      setNotification(notification);
    });

    // Hear clicks in notifications
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notificación clickeada:', response);
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [currentUser]);

  return { expoPushToken, notification };
};

// Function to register the device for notifications
async function registerForPushNotificationsAsync() {
  try {
    console.log('📋 Solicitando permisos de notificación...');

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('❌ Permisos de notificación no otorgados');
      return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('✅ Token obtenido:', token);
    return token;
  } catch (error) {
    console.error('❌ Error obteniendo token push:', error);
    return null;
  }
}