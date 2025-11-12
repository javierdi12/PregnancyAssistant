import DateTimePicker from '@react-native-community/datetimepicker';
import { onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import * as NotificationService from '../../services/notificationService';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getStyles } from '../../styles/citas.styles';
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
