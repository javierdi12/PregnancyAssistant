import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { onAuthStateChanged } from 'firebase/auth';

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
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';

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
  date: string;
  time: string;
  notes: string;
  createdAt: Timestamp;
}

export default function TrackingScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const styles = getStyles(isDarkMode);

  // Auth state
  const [userId, setUserId] = useState<string | null>(null);

  // State for Fetal Development
  const [lmp, setLmp] = useState<Date | null>(null); // Last Menstrual Period
  const [currentWeek, setCurrentWeek] = useState<number | null>(null);
  const [showLmpPicker, setShowLmpPicker] = useState(false);

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

  // Listen for auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log(`[Auth] User detected: ${user.uid}`);
        setUserId(user.uid);
      } else {
        console.log('[Auth] No user detected.');
        setUserId(null);
      }
    });
    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  // Fetch data when userId is available
  useEffect(() => {
    if (!userId) {
      // Clear all data and stop loading if user logs out
      setLmp(null);
      setVitalsList([]);
      setSymptomsList([]);
      setAppointmentsList([]);
      setLoading(false);
      return;
    }

    console.log(`[Data] Setting up listeners for userId: ${userId}`);
    setLoading(true);

    // --- Setup listeners for user-specific data ---
    const userDocRef = doc(db, 'users', userId);

    // 1. Fetch LMP (one-time fetch)
    getDoc(userDocRef)
      .then(docSnap => {
        console.log('[Data] LMP document snapshot received.');
        if (docSnap.exists() && docSnap.data().lmp) {
          console.log('[Data] LMP found in document:', docSnap.data().lmp.toDate());
          setLmp(docSnap.data().lmp.toDate());
        } else {
          console.log('[Data] LMP not found for this user.');
          setLmp(null); // Clear LMP if not found for this user
        }
      })
      .catch(error => console.error("Error fetching LMP: ", error))
      .finally(() => setLoading(false)); // Stop loading after LMP is checked

    // 2. Listen for vitals changes
    const vitalsQuery = query(collection(db, 'users', userId, 'vitals'), orderBy('createdAt', 'desc'));
    const unsubscribeVitals = onSnapshot(vitalsQuery, (snapshot) => {
      const vitalsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vitals));
      console.log('[Data] Vitals received:', vitalsData);
      setVitalsList(vitalsData);
    });

    // 3. Listen for symptoms changes
    const symptomsQuery = query(collection(db, 'users', userId, 'symptoms'), orderBy('createdAt', 'desc'));
    const unsubscribeSymptoms = onSnapshot(symptomsQuery, (snapshot) => {
      const symptomsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Symptom));
      console.log('[Data] Symptoms received:', symptomsData);
      setSymptomsList(symptomsData);
    });

    // 4. Listen for appointments changes
    const appointmentsQuery = query(collection(db, 'users', userId, 'appointments'), orderBy('createdAt', 'desc'));
    const unsubscribeAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
      const appointmentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
      console.log('[Data] Appointments received:', appointmentsData);
      setAppointmentsList(appointmentsData);
    });

    // Return a cleanup function to unsubscribe from listeners on unmount
    return () => {
      console.log(`[Data] Cleaning up listeners for userId: ${userId}`);
      unsubscribeVitals();
      unsubscribeSymptoms();
      unsubscribeAppointments();
    };
  }, [userId]);

  // Calculate week when LMP changes
  useEffect(() => {
    if (lmp) {
      const today = new Date();
      if (lmp > today) {
        setCurrentWeek(0);
        return;
      }
      const diffTime = Math.abs(today.getTime() - lmp.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const currentWeekNumber = Math.floor(diffDays / 7);
      setCurrentWeek(currentWeekNumber);
    } else {
      setCurrentWeek(null); // Clear week if LMP is cleared
    }
  }, [lmp]);

  const handleLmpChange = (event: any, selectedDate?: Date) => {
    setShowLmpPicker(false);
    if (selectedDate && userId) {
      const today = new Date();
      if (selectedDate > today) {
        Alert.alert("Fecha inválida", "La fecha de última menstruación no puede ser en el futuro.");
        return;
      }
      setLmp(selectedDate);
      const userDocRef = doc(db, 'users', userId);
      setDoc(userDocRef, { lmp: selectedDate }, { merge: true });
    }
  };

  const handleSaveVitals = async () => {
    if (!userId) {
      Alert.alert('Error', 'No user ID found. Cannot save.');
      return;
    }
    if (!weight || !bloodPressure) {
      Alert.alert('Error', 'Por favor, ingrese el peso y la presión arterial.');
      return;
    }
    console.log(`[Data] Saving vitals for userId: ${userId}`);
    try {
      await addDoc(collection(db, 'users', userId, 'vitals'), {
        weight,
        bloodPressure,
        date: new Date().toLocaleDateString(),
        createdAt: serverTimestamp(),
      });
      setWeight('');
      setBloodPressure('');
      Alert.alert('Éxito', '¡Signos vitales guardados con éxito!');
    } catch (error) {
      console.error('Error saving vitals: ', error);
      Alert.alert('Error', 'No se pudieron guardar los signos vitales.');
    }
  };

  const handleSaveSymptom = async () => {
    if (!userId) {
        Alert.alert('Error', 'No user ID found. Cannot save.');
        return;
    }
    if (!symptom) {
      Alert.alert('Error', 'Por favor, ingrese un síntoma.');
      return;
    }
    console.log(`[Data] Saving symptom for userId: ${userId}`);
    try {
      await addDoc(collection(db, 'users', userId, 'symptoms'), {
        symptom,
        date: new Date().toLocaleDateString(),
        createdAt: serverTimestamp(),
      });
      setSymptom('');
      Alert.alert('Éxito', '¡Síntoma guardado con éxito!');
    } catch (error) {
      console.error('Error saving symptom: ', error);
      Alert.alert('Error', 'No se pudo guardar el síntoma.');
    }
  };

  const handleSaveAppointment = async () => {
    if (!userId) {
        Alert.alert('Error', 'No user ID found. Cannot save.');
        return;
    }
    if (!appointmentDate || !appointmentTime) {
      Alert.alert('Error', 'Por favor, complete la fecha y hora de la cita.');
      return;
    }
    console.log(`[Data] Saving appointment for userId: ${userId}`);
    try {
      await addDoc(collection(db, 'users', userId, 'appointments'), {
        date: appointmentDate,
        time: appointmentTime,
        notes: appointmentNotes,
        createdAt: serverTimestamp(),
      });
      setAppointmentDate('');
      setAppointmentTime('');
      setAppointmentNotes('');
      Alert.alert('Éxito', '¡Cita guardada con éxito!');
    } catch (error) {
      console.error('Error saving appointment: ', error);
      Alert.alert('Error', 'No se pudo guardar la cita.');
    }
  };
  
  const getFetusImageSource = (week: number | null) => {
    if (week === null) {
      return require('../../assets/images/fetus/placeholder.png');
    }

    switch (week) {
      case 1:
        return require('../../assets/images/fetus/semana_1.png');
      case 2:
        return require('../../assets/images/fetus/semana_2.png');
      case 3:
        return require('../../assets/images/fetus/semana_3.png');
      case 4:
        return require('../../assets/images/fetus/semana_4.png');
      // TODO: For each image you add to the 'fetus' folder, add a case here.
      /*
      case 5:
        return require('../../assets/images/fetus/semana_5.png');
      case 6:
        return require('../../assets/images/fetus/semana_6.png');
      */
      
      default:
        return require('../../assets/images/fetus/placeholder.png');
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
            <ThemedText>Por favor, inicia sesión para ver tus datos.</ThemedText>
        </ThemedView>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollViewContent}>
      {/* Fetal Development Tracking */}
      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Seguimiento del Desarrollo Fetal</ThemedText>
        {lmp && currentWeek !== null ? (
          <>
            <Image
              source={getFetusImageSource(currentWeek)}
              style={styles.fetalImage}
              onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
            />
            <ThemedText style={styles.weekText}>Semana Actual: {currentWeek}</ThemedText>
            <TouchableOpacity style={styles.button} onPress={() => setShowLmpPicker(true)}>
              <Text style={styles.buttonText}>Cambiar FUM</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <ThemedText style={styles.emptyListText}>
              Para comenzar, por favor ingresa la fecha de tu última menstruación.
            </ThemedText>
            <TouchableOpacity style={styles.button} onPress={() => setShowLmpPicker(true)}>
              <Text style={styles.buttonText}>Ingresar FUM</Text>
            </TouchableOpacity>
          </>
        )}
        {showLmpPicker && (
          <DateTimePicker
            value={lmp || new Date()}
            mode="date"
            display="default"
            onChange={handleLmpChange}
          />
        )}
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
          <Text style={styles.buttonText}>Guardar Signos Vitales</Text>
        </TouchableOpacity>

        <ThemedText style={styles.listTitle}>Historial de Signos Vitales</ThemedText>
        {vitalsList.length > 0 ? (
          vitalsList.map((item) => (
            <View key={item.id} style={{ backgroundColor: isDarkMode ? '#333' : '#EEE', padding: 10, marginVertical: 4, borderRadius: 5 }}>
              <Text style={{ color: isDarkMode ? 'white' : 'black' }}>Peso: {item.weight} kg, Presión: {item.bloodPressure}</Text>
              <Text style={{ color: isDarkMode ? '#AAA' : '#555', fontSize: 12 }}>Fecha: {item.date}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyListText}>No hay signos vitales registrados.</Text>
        )}
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
          <Text style={styles.buttonText}>Guardar Síntoma</Text>
        </TouchableOpacity>

        <ThemedText style={styles.listTitle}>Historial de Síntomas</ThemedText>
        {symptomsList.length > 0 ? (
          symptomsList.map((item) => (
            <View key={item.id} style={styles.listItem}>
              <Text style={styles.logText}>{item.symptom}</Text>
              <Text style={styles.logTextDate}>Fecha: {item.date}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyListText}>No hay síntomas registrados.</Text>
        )}
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
  fetalImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#ccc',
    resizeMode: 'contain',
  },
  weekText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
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
  logTextDate: {
    fontSize: 12,
    color: isDarkMode ? '#aaa' : '#777',
    marginTop: 4,
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