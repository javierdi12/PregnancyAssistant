import DateTimePicker from '@react-native-community/datetimepicker';
import { onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import * as NotificationService from '../../services/notificationService';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { auth, db } from '../../FireBase';

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

    if (!appointmentNotes.trim()) {
          Alert.alert('💭 Espera', 'Por favor, agrega algunas notas sobre tu cita.');
          return;
        }
        
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
          "💕 Recordatorio de Cita",
          `¡Recuerda tu cita de mañana! Es a las ${appointmentDateTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}. 🌸`
        );
      } else {
        console.warn('La fecha del recordatorio ya pasó. No se programará la notificación.');
      }

      setAppointmentDateTime(new Date());
      setAppointmentNotes('');
      Alert.alert(
         '✨ ¡Perfecto!', 
        '¡Cita guardada con éxito! Te enviaremos un recordatorio el día anterior. 💝'
      );
    } catch (error) {
      console.error('Error al guardar o programar la cita:', error);
      Alert.alert('😔 Error', 'No se pudo guardar la cita. Por favor, intenta de nuevo.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#FF6B9D" />
        <ThemedText style={styles.loadingText}>✨ Cargando tus citas...</ThemedText>
      </View>
    );
  }

  if (!userId) {
    return (
        <ThemedView style={[styles.container, styles.centerContent]}>
          <Text style={styles.emptyIcon}>💭</Text>
          <ThemedText style={styles.emptyText}>
            Por favor, inicia sesión para gestionar tus citas médicas.
          </ThemedText>
        </ThemedView>
    )
  }

  return (
    <ScrollView style={styles.container} 
    contentContainerStyle={styles.scrollViewContent}
    showsVerticalScrollIndicator={false}
    >

      
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

       <View style={styles.notesContainer}>
                 <Text style={styles.inputLabel}>📝 Notas</Text>
                 <TextInput
                   style={styles.textArea}
                   placeholder="Ej: Control prenatal con la Dra. García..."
                   placeholderTextColor={isDarkMode ? '#6B5B62' : '#C4A4B4'}
                   multiline
                   numberOfLines={4}
                   value={appointmentNotes}
                   onChangeText={setAppointmentNotes}
                 />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveAppointment}>
          <Text style={styles.saveButtonText}>✨ Guardar Cita</Text>
        </TouchableOpacity>
      </ThemedView>

        {/* Appointments List */}
              <View style={styles.listSection}>
                <ThemedText style={styles.listTitle}>💕 Próximas Citas</ThemedText>
                {appointmentsList.length > 0 ? (
                  appointmentsList.map((item, index) => (
                    <View key={item.id} style={styles.appointmentCard}>
                      <View style={styles.appointmentHeader}>
                        <View style={styles.appointmentDateBadge}>
                          <Text style={styles.appointmentDateIcon}>📅</Text>
                        </View>
                        <View style={styles.appointmentInfo}>
                          <Text style={styles.appointmentDate}>{item.date}</Text>
                          <Text style={styles.appointmentTime}>⏰ {item.time}</Text>
                        </View>
                      </View>
                      <Text style={styles.appointmentNotes}>{item.notes}</Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyStateCard}>
                    <Text style={styles.emptyStateIcon}>📋</Text>
                    <Text style={styles.emptyStateText}>
                      Aún no tienes citas programadas.{'\n'}¡Agenda tu primera cita médica!
                    </Text>
                  </View>
                )}
              </View>
    </ScrollView>
  );
}

const getStyles = (isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? '#121212' : '#FFF5F8',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollViewContent: {
    padding: 20,
    paddingBottom: 40,
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
    backgroundColor: isDarkMode ? '#3D3147' : '#FFF5F8',
    borderWidth: 1,
    borderColor: isDarkMode ? '#6B5B62' : '#FFE4ED',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
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
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: isDarkMode ? '#FFB6D9' : '#C62368',
  },
   notesContainer: {
    marginBottom: 20,
  },

  saveButton: {
    backgroundColor: isDarkMode ? '#B794F6' : '#FF6B9D',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  listSection: {
    marginTop: 8,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: isDarkMode ? '#FFB6D9' : '#C62368',
    paddingHorizontal: 4,
  },
  appointmentCard: {
    backgroundColor: isDarkMode ? '#2A2335' : '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: isDarkMode ? '#000' : '#D6336C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: isDarkMode ? '#3D3147' : '#FFE4ED',
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  appointmentDateBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: isDarkMode ? '#3D3147' : '#FFE4ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
   appointmentDateIcon: {
    fontSize: 24,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentDate: {
    fontSize: 16,
    fontWeight: '700',
    color: isDarkMode ? '#FFB6D9' : '#C62368',
    marginBottom: 4,
  },
  appointmentTime: {
    fontSize: 14,
    color: isDarkMode ? '#D4A5C0' : '#9E7B8E',
    fontWeight: '500',
  },
  appointmentNotes: {
    fontSize: 14,
    lineHeight: 20,
    color: isDarkMode ? '#D4A5C0' : '#6B5B62',
  },
  emptyStateCard: {
    backgroundColor: isDarkMode ? '#2A2335' : '#FFFFFF',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isDarkMode ? '#3D3147' : '#FFE4ED',
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 20,
    color: isDarkMode ? '#aaa' : '#777',
  },
   emptyStateText: {
    fontSize: 15,
    textAlign: 'center',
    color: isDarkMode ? '#D4A5C0' : '#9E7B8E',
    lineHeight: 22,
  },
   emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: isDarkMode ? '#D4A5C0' : '#9E7B8E',
    lineHeight: 24,
  },
 loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: isDarkMode ? '#FFB6D9' : '#D6336C',
    fontWeight: '600',
  },
});