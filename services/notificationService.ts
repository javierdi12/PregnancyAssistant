import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../FireBase';

// Configura cómo se deben manejar las notificaciones cuando la app está en primer plano.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Solicita permisos para enviar notificaciones.
 * En Android, también crea un "canal" de notificación, que es obligatorio.
 * @returns {Promise<boolean>} - Devuelve true si el permiso fue otorgado.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  console.log('Solicitando permisos de notificación...');
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status } = await Notifications.requestPermissionsAsync();
  console.log(`Estado del permiso de notificación: ${status}`);
  if (status !== 'granted') {
    alert('¡Necesitas habilitar los permisos de notificación para recibir recordatorios de citas!');
    return false;
  }
  return true;
}

/**
 * Gets the Expo push token and saves it to the user's Firestore document.
 */
export async function registerForPushNotificationsAsync() {
  const hasPermissions = await requestNotificationPermissions();
  if (!hasPermissions) {
    console.error('Could not get push token because notification permissions were not granted.');
    return;
  }

  const token = (await Notifications.getDevicePushTokenAsync()).data;
  console.log('User push token:', token);

  const user = auth.currentUser;
  if (user && token) {
    const userDocRef = doc(db, 'users', user.uid);
    try {
      await setDoc(userDocRef, { pushToken: token }, { merge: true });
      console.log('Successfully saved push token for user:', user.uid);
    } catch (error) {
      console.error('Error saving push token to Firestore:', error);
    }
  }
}

/**
 * Programa una notificación local para una fecha y hora específicas.
 * @param {Date} date - La fecha y hora en que se debe mostrar la notificación.
 * @param {string} title - El título de la notificación (ej. "Recordatorio de Cita").
 * @param {string} body - El cuerpo del mensaje de la notificación (ej. "Tienes una cita médica mañana a las 10:00 AM").
 * @returns {Promise<string | null>} - El ID de la notificación programada o null si no se pudo programar.
 */
export async function scheduleAppointmentNotification(date: Date, title: string, body: string): Promise<string | null> {
  console.log('Intentando programar una notificación...');
  const hasPermissions = await requestNotificationPermissions();
  if (!hasPermissions) {
    console.error('No se pudo programar la notificación porque no se concedieron los permisos.');
    return null;
  }

  // Programa la notificación para que se dispare en la fecha indicada.
  const trigger = date;

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { screen: 'citas' }, // Dato opcional para redirigir al usuario si toca la notificación
    },
    trigger,
  });

  console.log(`Notificación programada con éxito. ID: ${notificationId}`);
  return notificationId;
}

/**
 * Cancela una notificación programada previamente.
 * @param {string} notificationId - El ID de la notificación que se desea cancelar.
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
  console.log(`Notificación cancelada con ID: ${notificationId}`);
}


const DAILY_REMINDER_BREAKFAST_ID = 'daily-reminder-breakfast';
const DAILY_REMINDER_LUNCH_ID = 'daily-reminder-lunch';
const DAILY_REMINDER_DINNER_ID = 'daily-reminder-dinner';

const REMINDERS = [
  { id: DAILY_REMINDER_BREAKFAST_ID, hour: 7, title: '🍎 Hora del Desayuno', body: '¡Buen día! Recuerda empezar con una comida saludable y tomar un vaso de agua.' },
  { id: DAILY_REMINDER_LUNCH_ID, hour: 11, title: '🥗 Hora del Almuerzo', body: 'Es un buen momento para una comida nutritiva. ¡No olvides tomar agua!' },
  { id: DAILY_REMINDER_DINNER_ID, hour: 17, title: '🍲 Hora de la Cena', body: 'Opta por una cena ligera y saludable. ¡Y acompáñala con agua!' },
];

/**
 * Schedules the single next meal reminder.
 * This cancels all previous reminders and schedules only the next one to avoid spamming the user.
 */
export async function scheduleDailyFoodReminders(): Promise<void> {
  const hasPermissions = await requestNotificationPermissions();
  if (!hasPermissions) {
    console.error('Cannot schedule daily reminders without notification permissions.');
    return;
  }

  // 1. Cancel all previously scheduled daily reminders to ensure a clean slate.
  await cancelDailyFoodReminders();

  // 2. Find the next reminder to schedule.
  const now = new Date();
  let nextReminder = null;

  // Find the next reminder for today
  for (const reminder of REMINDERS) {
    if (now.getHours() < reminder.hour) {
      nextReminder = reminder;
      break;
    }
  }

  const nextTriggerDate = new Date();

  if (nextReminder) {
    // A reminder was found for later today
    nextTriggerDate.setHours(nextReminder.hour, 0, 0, 0);
  } else {
    // All reminders for today have passed, schedule the first one for tomorrow
    nextReminder = REMINDERS[0];
    nextTriggerDate.setDate(now.getDate() + 1);
    nextTriggerDate.setHours(nextReminder.hour, 0, 0, 0);
  }

  // 3. Schedule the single, non-repeating notification
  console.log(`Programando el próximo recordatorio (${nextReminder.title}) para ${nextTriggerDate.toString()}`);
  await Notifications.scheduleNotificationAsync({
    identifier: nextReminder.id,
    content: {
      title: nextReminder.title,
      body: nextReminder.body,
    },
    trigger: nextTriggerDate,
  });
}

/**
 * Cancels all daily food and water reminders.
 */
export async function cancelDailyFoodReminders(): Promise<void> {
  console.log('Cancelando todos los recordatorios diarios...');
  await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_BREAKFAST_ID);
  await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_LUNCH_ID);
  await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_DINNER_ID);
  console.log('Recordatorios diarios cancelados.');
}