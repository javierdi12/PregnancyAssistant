// This component provides a comprehensive tracking screen for pregnancy, allowing users to monitor fetal development, vital signs, symptoms, and appointments.

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { auth, db } from '../../FireBase';

// Define types for our data structures for better type checking
/**
 * Interface for an Appointment record.
 */
interface Appointment {
  id: string;
  date: string;
  time: string;
  notes: string;
  createdAt: Timestamp;
}

/**
 * Interface for a Symptom record.
 */
interface Symptom {
  id: string;
  symptom: string;
  date: string;
  createdAt: Timestamp;
}

/**
 * Interface for Vitals record.
 */
interface Vitals {
  id: string;
  weight: string;
  bloodPressure: string;
  createdAt: Timestamp;
  date: string;
}

/**
 * TrackingScreen component displays various pregnancy tracking features.
 * It allows users to log vitals, symptoms, and appointments, and view fetal development.
 */
export default function TrackingScreen() {
  // Hook to determine the current color scheme (light/dark) for UI theming.
  const colorScheme = useColorScheme();
  // Boolean to check if dark mode is active.
  const isDarkMode = colorScheme === 'dark';

  // State to manage the loading status of data.
  const [loading, setLoading] = useState(true);
  // State to store the current week of pregnancy for fetal development tracking.
  const [currentWeek] = useState(10);

  // States for vital signs input and history.
  const [weight, setWeight] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [vitalsHistory, setVitalsHistory] = useState<Vitals[]>([]);

  // States for symptom input and history.
  const [symptom, setSymptom] = useState('');
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);

  // States for appointment input and history.
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [appointmentNotes, setAppointmentNotes] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  /**
   * Generic function to fetch data from a specified Firestore collection.
   * @param collectionName The name of the collection to fetch (e.g., 'vitals', 'symptoms').
   * @param setData The state setter function to update the component's state with the fetched data.
   */
  const fetchCollectionData = async <T extends { id: string }>(
    collectionName: string,
    setData: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const q = query(
        collection(db, 'users', user.uid, collectionName),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
      setData(data);
    } catch (error) {
      console.error(`Error fetching ${collectionName} data: `, error);
      Alert.alert('Error', `Could not retrieve ${collectionName} from the cloud.`);
    }
  };

  /**
   * useEffect hook to fetch data from Firestore when the component mounts.
   * It fetches vitals history, symptoms, and appointments for the current user.
   */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchCollectionData<Vitals>('vitals', setVitalsHistory),
        fetchCollectionData<Symptom>('symptoms', setSymptoms),
        fetchCollectionData<Appointment>('appointments', setAppointments),
      ]);
      setLoading(false);
    };

    fetchData();
  }, []);

  /**
   * Generic function to add a new document to a specified Firestore collection.
   * @param collectionName The name of the collection to add the document to.
   * @param newDocument The document data to add.
   * @param setData The state setter function to update the component's state with the new document.
   * @param successMessage Optional success message to display.
   * @param errorMessage Optional error message to display.
   */
  const addDocumentToCollection = async <T extends { id: string }>(
    collectionName: string,
    newDocument: Omit<T, 'id'>,
    setData: React.Dispatch<React.SetStateAction<T[]>>,
    successMessage?: string,
    errorMessage?: string
  ) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const docRef = await addDoc(collection(db, 'users', user.uid, collectionName), newDocument);
      setData(prev => [{ id: docRef.id, ...newDocument } as T, ...prev]);
      if (successMessage) Alert.alert('Success', successMessage);
    } catch (error) {
      console.error(`Error adding ${collectionName} document: `, error);
      Alert.alert('Error', errorMessage || `Could not save the ${collectionName}.`);
    }
  };

  /**
   * Handles adding a new symptom to Firestore.
   * Requires user to be authenticated and symptom input not to be empty.
   */
  const handleAddSymptom = async () => {
    const user = auth.currentUser;
    if (!user || !symptom.trim()) return;

    const newSymptom = {
      symptom,
      date: new Date().toLocaleDateString(),
      createdAt: Timestamp.now(),
    };

    await addDocumentToCollection<Symptom>(
      'symptoms',
      newSymptom,
      setSymptoms,
      undefined,
      'Could not save the symptom.'
    );
    setSymptom(''); // Clear input field after submission.
  };

  /**
   * Handles adding a new appointment to Firestore.
   * Requires user to be authenticated and appointment date/time not to be empty.
   */
  const handleAddAppointment = async () => {
    const user = auth.currentUser;
    if (!user || !appointmentDate.trim() || !appointmentTime.trim()) return;

    const newAppointment = {
      date: appointmentDate,
      time: appointmentTime,
      notes: appointmentNotes,
      createdAt: Timestamp.now(),
    };

    await addDocumentToCollection<Appointment>(
      'appointments',
      newAppointment,
      setAppointments,
      undefined,
      'Could not save the appointment.'
    );
    setAppointmentDate(''); // Clear input field after submission.
    setAppointmentTime(''); // Clear input field after submission.
    setAppointmentNotes(''); // Clear input field after submission.
  };

  /**
   * Handles adding new vital signs to Firestore.
   * Requires user to be authenticated and at least weight or blood pressure to be entered.
   */
  const handleAddVitals = async () => {
    const user = auth.currentUser;
    if (!user || (!weight.trim() && !bloodPressure.trim())) return;

    const newVitals = {
      weight,
      bloodPressure,
      date: new Date().toLocaleDateString(),
      createdAt: Timestamp.now(),
    };

    await addDocumentToCollection<Vitals>(
      'vitals',
      newVitals,
      setVitalsHistory,
      'Vital signs saved successfully.',
      'Could not save vital signs.'
    );
    setWeight(''); // Clear input field after submission.
    setBloodPressure(''); // Clear input field after submission.
  };

  // Dynamically create styles based on the current dark mode setting.
  const styles = getStyles(isDarkMode);

  /**
   * Generates a placeholder image URL for fetal development based on the current week.
   * In a real application, this would be replaced with actual images or a more sophisticated image generation logic.
   * @param week The current week of pregnancy.
   * @returns A URL for a placeholder image.
   */
  const getFetusImage = (week: number) => {
    return `https://via.placeholder.com/300x300.png?text=Fetus+Week+${week}`;
  };

  // Display a loading indicator while data is being fetched.
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={isDarkMode ? Colors.dark.tint : Colors.light.tint} />
      </View>
    );
  }

  return (
    // Main scrollable container for the tracking screen.
    <ScrollView style={styles.container}>
      {/* Section for Fetal Development Tracking */}
      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Fetal Development Weekly</ThemedText>
        <Image source={{ uri: getFetusImage(currentWeek) }} style={styles.fetusImage} />
        <ThemedText style={styles.weekText}>Current Week: {currentWeek}</ThemedText>
      </ThemedView>

      {/* Section for Vital Signs Tracking */}
      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Vital Signs Tracking</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Weight (e.g., 70 kg)"
          placeholderTextColor={isDarkMode ? '#888' : '#999'}
          value={weight}
          onChangeText={setWeight}
        />
        <TextInput
          style={styles.input}
          placeholder="Blood Pressure (e.g., 120/80)"
          placeholderTextColor={isDarkMode ? '#888' : '#999'}
          value={bloodPressure}
          onChangeText={setBloodPressure}
        />
        <TouchableOpacity style={styles.button} onPress={handleAddVitals}>
          <Text style={styles.buttonText}>Save Vital Signs</Text>
        </TouchableOpacity>
        <FlatList
          data={vitalsHistory}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.logItem}>
              <Text style={styles.logText}>{item.date}: Weight: {item.weight}, BP: {item.bloodPressure}</Text>
            </View>
          )}
        />
      </ThemedView>

      {/* Section for Symptom Logging */}
      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Symptom Log</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Enter a symptom (e.g., Nausea)"
          placeholderTextColor={isDarkMode ? '#888' : '#999'}
          value={symptom}
          onChangeText={setSymptom}
        />
        <TouchableOpacity style={styles.button} onPress={handleAddSymptom}>
          <Text style={styles.buttonText}>Add Symptom</Text>
        </TouchableOpacity>
        <FlatList
          data={symptoms}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.logItem}>
              <Text style={styles.logText}>{item.symptom} - {item.date}</Text>
            </View>
          )}
        />
      </ThemedView>

      {/* Section for Medical Appointments */}
      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Medical Appointments</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Date (e.g., 2025-12-25)"
          placeholderTextColor={isDarkMode ? '#888' : '#999'}
          value={appointmentDate}
          onChangeText={setAppointmentDate}
        />
        <TextInput
          style={styles.input}
          placeholder="Time (e.g., 10:00 AM)"
          placeholderTextColor={isDarkMode ? '#888' : '#999'}
          value={appointmentTime}
          onChangeText={setAppointmentTime}
        />
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="Notes..."
          placeholderTextColor={isDarkMode ? '#888' : '#999'}
          value={appointmentNotes}
          onChangeText={setAppointmentNotes}
          multiline
        />
        <TouchableOpacity style={styles.button} onPress={handleAddAppointment}>
          <Text style={styles.buttonText}>Add Appointment</Text>
        </TouchableOpacity>
        <FlatList
          data={appointments}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.logItem}>
              <Text style={styles.logTextBold}>{item.date} at {item.time}</Text>
              <Text style={styles.logText}>{item.notes}</Text>
            </View>
          )}
        />
      </ThemedView>
    </ScrollView>
  );
}

const getStyles = (isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? '#121212' : '#FAFAFA',
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: isDarkMode ? Colors.dark.text : Colors.light.text,
  },
  fetusImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#ccc',
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
  multilineInput: {
    height: 100,
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
  logItem: {
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
});