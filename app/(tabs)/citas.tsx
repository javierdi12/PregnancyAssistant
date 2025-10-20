import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Text,
  View,
  useColorScheme,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { onAuthStateChanged } from 'firebase/auth';
import * as NotificationService from '../../services/notificationService';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { auth, db } from '../../FireBase';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

// Interface for data structure
interface Appointment {
  id: string;
  date: string;
  time: string;
  notes: string;
  createdAt: Timestamp;
}

export default function CitasScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const styles = getStyles(isDarkMode);

  // Auth state
  const [userId, setUserId] = useState<string | null>(null);

  // State for Appointments
  const [appointmentDateTime, setAppointmentDateTime] = useState(new Date());
  const [appointmentNotes, setAppointmentNotes] = useState<string>('');
  const [appointmentsList, setAppointmentsList] = useState<Appointment[]>([]);
  const [showAppointmentDatePicker, setShowAppointmentDatePicker] = useState(false);
  const [showAppointmentTimePicker, setShowAppointmentTimePicker] = useState(false);

  // Loading state
  const [loading, setLoading] = useState<boolean>(true);

  // Request notification permissions when the component mounts
  useEffect(() => {
    NotificationService.requestNotificationPermissions();
  }, []);

  // Listen for auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch data when userId is available
  useEffect(() => {
    if (!userId) {
      setAppointmentsList([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const appointmentsQuery = query(collection(db, 'users', userId, 'appointments'), orderBy('createdAt', 'desc'));
    const unsubscribeAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
      const appointmentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
      setAppointmentsList(appointmentsData);
      setLoading(false);
    });

    return () => {
      unsubscribeAppointments();
    };
  }, [userId]);

  const handleAppointmentDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || appointmentDateTime;
    setShowAppointmentDatePicker(Platform.OS === 'ios');
    setAppointmentDateTime(currentDate);
    if (Platform.OS !== 'ios') {
        setShowAppointmentDatePicker(false);
    }
  };

  const handleAppointmentTimeChange = (event: any, selectedDate?: Date) => {
    const currentTime = selectedDate || appointmentDateTime;
    setShowAppointmentTimePicker(Platform.OS === 'ios');
    setAppointmentDateTime(currentTime);
    if (Platform.OS !== 'ios') {
        setShowAppointmentTimePicker(false);
    }
  };

  const handleSaveAppointment = async () => {
    if (!userId) return;
    try {
      await addDoc(collection(db, 'users', userId, 'appointments'), {
        date: appointmentDateTime.toLocaleDateString('es-ES'),
        time: appointmentDateTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        notes: appointmentNotes,
        createdAt: serverTimestamp(),
      });
      
      console.log('--- Inciando programación de notificación ---');
      console.log(`Fecha de la cita seleccionada: ${appointmentDateTime.toString()}`);

      // Schedule notification 1 day before the appointment
      const reminderDate = new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000);
      console.log(`Fecha calculada para el recordatorio: ${reminderDate.toString()}`);

      if (reminderDate.getTime() > Date.now()) {
        console.log('La fecha del recordatorio es en el futuro, programando...');
        await NotificationService.scheduleAppointmentNotification(
          reminderDate,
          "Recordatorio de Cita",
          `¡Recuerda tu cita de mañana! Es a las ${appointmentDateTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}.`
        );
      } else {
        console.warn('La fecha del recordatorio ya pasó. No se programará la notificación.');
      }

      setAppointmentDateTime(new Date());
      setAppointmentNotes('');
      Alert.alert('Éxito', '¡Cita guardada con éxito! Se ha programado un recordatorio para el día anterior.');
    } catch (error) {
      console.error('Error al guardar o programar la cita:', error);
      Alert.alert('Error', 'No se pudo guardar la cita.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={isDarkMode ? Colors.dark.tint : Colors.light.tint} />
      </View>
    );
  }

  if (!userId) {
    return (
        <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
            <ThemedText>Por favor, inicia sesión para gestionar tus citas.</ThemedText>
        </ThemedView>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollViewContent}>
      {/* Medical Appointments */}
      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Gestión de Citas Médicas</ThemedText>
        
        <TouchableOpacity onPress={() => setShowAppointmentDatePicker(true)} style={styles.inputButton}>
            <Text style={styles.inputText}>
                {`Fecha: ${appointmentDateTime.toLocaleDateString('es-ES')}`}
            </Text>
        </TouchableOpacity>
        {showAppointmentDatePicker && (
            <DateTimePicker
                value={appointmentDateTime}
                mode="date"
                display="default"
                onChange={handleAppointmentDateChange}
            />
        )}

        <TouchableOpacity onPress={() => setShowAppointmentTimePicker(true)} style={styles.inputButton}>
            <Text style={styles.inputText}>
                {`Hora: ${appointmentDateTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`}
            </Text>
        </TouchableOpacity>
        {showAppointmentTimePicker && (
            <DateTimePicker
                value={appointmentDateTime}
                mode="time"
                display="default"
                onChange={handleAppointmentTimeChange}
            />
        )}

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Notas de la cita"
          placeholderTextColor={isDarkMode ? '#ccc' : '#666'}
          multiline
          numberOfLines={3}
          value={appointmentNotes}
          onChangeText={setAppointmentNotes}
        />
        <TouchableOpacity style={styles.button} onPress={handleSaveAppointment}>
          <Text style={styles.buttonText}>Guardar Cita</Text>
        </TouchableOpacity>

        <ThemedText style={styles.listTitle}>Próximas Citas</ThemedText>
        {appointmentsList.length > 0 ? (
          appointmentsList.map((item) => (
            <View key={item.id} style={styles.listItem}>
              <Text style={styles.logTextBold}>{item.date} a las {item.time}</Text>
              <Text style={styles.logText}>{item.notes}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyListText}>No hay citas registradas.</Text>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const getStyles = (isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? '#121212' : '#FAFAFA',
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginVertical: 8,
    padding: 16,
    borderRadius: 8,
    backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: isDarkMode ? Colors.dark.text : Colors.light.text,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: isDarkMode ? '#555' : '#E8EAF6',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: isDarkMode ? '#FFFFFF' : '#333333',
    backgroundColor: isDarkMode ? '#2a2a2a' : '#F5F5F5',
  },
  inputButton: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: isDarkMode ? '#555' : '#E8EAF6',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: isDarkMode ? '#2a2a2a' : '#F5F5F5',
    justifyContent: 'center',
  },
  inputText: {
    color: isDarkMode ? '#FFFFFF' : '#333333',
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 15,
  },
  button: {
    backgroundColor: isDarkMode ? '#BB86FC' : '#5C6BC0',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: isDarkMode ? Colors.dark.text : Colors.light.text,
  },
  listItem: {
    backgroundColor: isDarkMode ? '#2a2a2a' : '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: isDarkMode ? '#444' : '#E0E0E0',
  },
  logText: {
    fontSize: 14,
    color: isDarkMode ? '#E0E0E0' : '#424242',
  },
  logTextBold: {
    fontSize: 16,
    fontWeight: 'bold',
    color: isDarkMode ? '#FFFFFF' : '#212121',
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 20,
    color: isDarkMode ? '#aaa' : '#777',
  },
});
