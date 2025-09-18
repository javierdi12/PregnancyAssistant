import React, { useState, useEffect } from 'react';
import { StyleSheet, Image, TextInput, TouchableOpacity, Alert, ActivityIndicator, FlatList, ScrollView } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';
import { auth, db } from '../../FireBase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';

// Interfaces for data structures
interface Vitals {
  id: string;
  weight: string;
  bloodPressure: string;
  date: string;
  createdAt: Timestamp;
}

interface Symptom {
  id: string;
  symptom: string;
  date: string;
  createdAt: Timestamp;
}

interface Appointment {
  id: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentNotes: string;
  createdAt: Timestamp;
}

export default function TrackingScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const styles = getStyles(isDarkMode);

  // State for Fetal Development
  const [currentWeek, setCurrentWeek] = useState<number>(10); // Default week

  // State for Vitals
  const [weight, setWeight] = useState<string>('');
  const [bloodPressure, setBloodPressure] = useState<string>('');
  const [vitalsList, setVitalsList] = useState<Vitals[]>([]);

  // State for Symptoms
  const [symptom, setSymptom] = useState<string>('');
  const [symptomsList, setSymptomsList] = useState<Symptom[]>([]);

  // State for Appointments
  const [appointmentDate, setAppointmentDate] = useState<string>('');
  const [appointmentTime, setAppointmentTime] = useState<string>('');
  const [appointmentNotes, setAppointmentNotes] = useState<string>('');
  const [appointmentsList, setAppointmentsList] = useState<Appointment[]>([]);

  // Loading state
  const [loading, setLoading] = useState<boolean>(true);

  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) {
      Alert.alert('Error', 'User not authenticated.');
      setLoading(false);
      return;
    }

    const fetchVitals = () => {
      const q = query(collection(db, 'users', userId, 'vitals'), orderBy('createdAt', 'desc'));
      return onSnapshot(q, (snapshot) => {
        const vitalsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vitals));
        setVitalsList(vitalsData);
      });
    };

    const fetchSymptoms = () => {
      const q = query(collection(db, 'users', userId, 'symptoms'), orderBy('createdAt', 'desc'));
      return onSnapshot(q, (snapshot) => {
        const symptomsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Symptom));
        setSymptomsList(symptomsData);
      });
    };

    const fetchAppointments = () => {
      const q = query(collection(db, 'users', userId, 'appointments'), orderBy('createdAt', 'desc'));
      return onSnapshot(q, (snapshot) => {
        const appointmentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
        setAppointmentsList(appointmentsData);
      });
    };

    const unsubscribeVitals = fetchVitals();
    const unsubscribeSymptoms = fetchSymptoms();
    const unsubscribeAppointments = fetchAppointments();

    setLoading(false);

    return () => {
      unsubscribeVitals();
      unsubscribeSymptoms();
      unsubscribeAppointments();
    };
  }, [userId]);

  const handleSaveVitals = async () => {
    if (!userId || !weight || !bloodPressure) {
      Alert.alert('Error', 'Please enter weight and blood pressure.');
      return;
    }
    try {
      await addDoc(collection(db, 'users', userId, 'vitals'), {
        weight,
        bloodPressure,
        date: new Date().toLocaleDateString(),
        createdAt: serverTimestamp(),
      });
      setWeight('');
      setBloodPressure('');
      Alert.alert('Success', 'Vitals saved successfully!');
    } catch (error) {
      console.error('Error saving vitals: ', error);
      Alert.alert('Error', 'Failed to save vitals.');
    }
  };

  const handleSaveSymptom = async () => {
    if (!userId || !symptom) {
      Alert.alert('Error', 'Please enter a symptom.');
      return;
    }
    try {
      await addDoc(collection(db, 'users', userId, 'symptoms'), {
        symptom,
        date: new Date().toLocaleDateString(),
        createdAt: serverTimestamp(),
      });
      setSymptom('');
      Alert.alert('Success', 'Symptom saved successfully!');
    } catch (error) {
      console.error('Error saving symptom: ', error);
      Alert.alert('Error', 'Failed to save symptom.');
    }
  };

  const handleSaveAppointment = async () => {
    if (!userId || !appointmentDate || !appointmentTime || !appointmentNotes) {
      Alert.alert('Error', 'Please fill all appointment fields.');
      return;
    }
    try {
      await addDoc(collection(db, 'users', userId, 'appointments'), {
        appointmentDate,
        appointmentTime,
        appointmentNotes,
        createdAt: serverTimestamp(),
      });
      setAppointmentDate('');
      setAppointmentTime('');
      setAppointmentNotes('');
      Alert.alert('Success', 'Appointment saved successfully!');
    } catch (error) {
      console.error('Error saving appointment: ', error);
      Alert.alert('Error', 'Failed to save appointment.');
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color={isDarkMode ? Colors.dark.tint : Colors.light.tint} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Fetal Development Tracking */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Seguimiento del Desarrollo Fetal</ThemedText>
          <Image
            source={{ uri: `https://via.placeholder.com/300x300.png?text=Feto+Semana+${currentWeek}` }}
            style={styles.fetalImage}
          />
          <ThemedText style={styles.weekText}>Semana Actual: {currentWeek}</ThemedText>
        </ThemedView>

        {/* Vitals Tracking */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Seguimiento de Signos Vitales</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Peso (kg)"
            placeholderTextColor={isDarkMode ? '#ccc' : '#666'}
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
          />
          <TextInput
            style={styles.input}
            placeholder="Presión Arterial (ej. 120/80)"
            placeholderTextColor={isDarkMode ? '#ccc' : '#666'}
            value={bloodPressure}
            onChangeText={setBloodPressure}
          />
          <TouchableOpacity style={styles.button} onPress={handleSaveVitals}>
            <ThemedText style={styles.buttonText}>Guardar Signos Vitales</ThemedText>
          </TouchableOpacity>

          <ThemedText style={styles.listTitle}>Historial de Signos Vitales</ThemedText>
          <FlatList
            data={vitalsList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ThemedView style={styles.listItem}>
                <ThemedText>Peso: {item.weight} kg</ThemedText>
                <ThemedText>Presión: {item.bloodPressure}</ThemedText>
                <ThemedText>Fecha: {item.date}</ThemedText>
              </ThemedView>
            )}
            ListEmptyComponent={<ThemedText style={styles.emptyListText}>No hay signos vitales registrados.</ThemedText>}
          />
        </ThemedView>

        {/* Symptom Logging */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Registro de Síntomas</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Describe tu síntoma"
            placeholderTextColor={isDarkMode ? '#ccc' : '#666'}
            value={symptom}
            onChangeText={setSymptom}
          />
          <TouchableOpacity style={styles.button} onPress={handleSaveSymptom}>
            <ThemedText style={styles.buttonText}>Guardar Síntoma</ThemedText>
          </TouchableOpacity>

          <ThemedText style={styles.listTitle}>Historial de Síntomas</ThemedText>
          <FlatList
            data={symptomsList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ThemedView style={styles.listItem}>
                <ThemedText>Síntoma: {item.symptom}</ThemedText>
                <ThemedText>Fecha: {item.date}</ThemedText>
              </ThemedView>
            )}
            ListEmptyComponent={<ThemedText style={styles.emptyListText}>No hay síntomas registrados.</ThemedText>}
          />
        </ThemedView>

        {/* Medical Appointments */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Gestión de Citas Médicas</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Fecha (DD/MM/AAAA)"
            placeholderTextColor={isDarkMode ? '#ccc' : '#666'}
            value={appointmentDate}
            onChangeText={setAppointmentDate}
          />
          <TextInput
            style={styles.input}
            placeholder="Hora (HH:MM)"
            placeholderTextColor={isDarkMode ? '#ccc' : '#666'}
            value={appointmentTime}
            onChangeText={setAppointmentTime}
          />
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
            <ThemedText style={styles.buttonText}>Guardar Cita</ThemedText>
          </TouchableOpacity>

          <ThemedText style={styles.listTitle}>Próximas Citas</ThemedText>
          <FlatList
            data={appointmentsList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ThemedView style={styles.listItem}>
                <ThemedText>Fecha: {item.appointmentDate}</ThemedText>
                <ThemedText>Hora: {item.appointmentTime}</ThemedText>
                <ThemedText>Notas: {item.appointmentNotes}</ThemedText>
              </ThemedView>
            )}
            ListEmptyComponent={<ThemedText style={styles.emptyListText}>No hay citas registradas.</ThemedText>}
          />
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const getStyles = (isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: isDarkMode ? Colors.dark.background : Colors.light.background,
    shadowColor: isDarkMode ? '#000' : '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: isDarkMode ? Colors.dark.text : Colors.light.text,
  },
  fetalImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginBottom: 10,
    borderRadius: 8,
  },
  weekText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    color: isDarkMode ? Colors.dark.text : Colors.light.text,
  },
  input: {
    height: 40,
    borderColor: isDarkMode ? '#555' : '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    color: isDarkMode ? Colors.dark.text : Colors.light.text,
    backgroundColor: isDarkMode ? '#333' : '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  button: {
    backgroundColor: isDarkMode ? Colors.dark.tint : Colors.light.tint,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: isDarkMode ? Colors.dark.text : Colors.light.text,
  },
  listItem: {
    padding: 10,
    borderBottomColor: isDarkMode ? '#444' : '#eee',
    borderBottomWidth: 1,
    backgroundColor: isDarkMode ? Colors.dark.cardBackground : Colors.light.cardBackground,
    borderRadius: 5,
    marginBottom: 5,
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 20,
    color: isDarkMode ? Colors.dark.text : Colors.light.text,
  },
});
