import DateTimePicker from '@react-native-community/datetimepicker';
import { onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme
} from 'react-native';
import * as NotificationService from '../../services/notificationService';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { auth, db } from '../../FireBase';

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

export default function TrackingScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const styles = getStyles(isDarkMode);

  // Auth state
  const [userId, setUserId] = useState<string | null>(null);

  // State for Fetal Development
  const [lmp, setLmp] = useState<Date | null>(null);
  const [currentWeek, setCurrentWeek] = useState<number | null>(null);
  const [showLmpPicker, setShowLmpPicker] = useState(false);

  // State for Vitals
  const [weight, setWeight] = useState<string>('');
  const [bloodPressure, setBloodPressure] = useState<string>('');
  const [vitalsList, setVitalsList] = useState<Vitals[]>([]);

  // State for Symptoms
  const [symptom, setSymptom] = useState<string>('');
  const [symptomsList, setSymptomsList] = useState<Symptom[]>([]);

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
      setLmp(null);
      setVitalsList([]);
      setSymptomsList([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const userDocRef = doc(db, 'users', userId);

    getDoc(userDocRef)
      .then(docSnap => {
        if (docSnap.exists() && docSnap.data().lmp) {
          setLmp(docSnap.data().lmp.toDate());
        } else {
          setLmp(null);
        }
      })
      .catch(error => console.error("Error fetching LMP: ", error))
      .finally(() => setLoading(false));

    const vitalsQuery = query(collection(db, 'users', userId, 'vitals'), orderBy('createdAt', 'desc'));
    const unsubscribeVitals = onSnapshot(vitalsQuery, (snapshot) => {
      const vitalsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vitals));
      setVitalsList(vitalsData);
    });

    const symptomsQuery = query(collection(db, 'users', userId, 'symptoms'), orderBy('createdAt', 'desc'));
    const unsubscribeSymptoms = onSnapshot(symptomsQuery, (snapshot) => {
      const symptomsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Symptom));
      setSymptomsList(symptomsData);
    });

    return () => {
      unsubscribeVitals();
      unsubscribeSymptoms();
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
      setCurrentWeek(null);
    }
  }, [lmp]);

  const handleLmpChange = (event: any, selectedDate?: Date) => {
    setShowLmpPicker(false);
    if (selectedDate && userId) {
      const today = new Date();
      if (selectedDate > today) {
        Alert.alert("📅 Fecha inválida", "La fecha de última menstruación no puede ser en el futuro. 💝")
        return;
      }
      setLmp(selectedDate);
      const userDocRef = doc(db, 'users', userId);
      setDoc(userDocRef, { lmp: selectedDate }, { merge: true });
      Alert.alert("✨ ¡Perfecto!", "Tu fecha ha sido guardada. ¡Ahora puedes ver el desarrollo de tu bebé! 💕")
    }
  };

  const handleSaveVitals = async () => {
    if (!userId) return;
    if (!weight || !bloodPressure) {
      Alert.alert("💭 Espera", "Por favor, ingresa tu peso y presión arterial para guardar tus signos vitales.")
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
      Alert.alert("✨ ¡Excelente!", "¡Tus signos vitales han sido guardados con éxito! 💗")
    } catch (error) {
      Alert.alert("😔 Error", "No se pudieron guardar tus signos vitales. Por favor, intenta de nuevo.")
    }
  };

  const handleSaveSymptom = async () => {
    if (!userId) return;
    if (!symptom) {
      Alert.alert("💭 Espera", "Por favor, describe tu síntoma para poder guardarlo.")
      return;
    }
    try {
      await addDoc(collection(db, 'users', userId, 'symptoms'), {
        symptom,
        date: new Date().toLocaleDateString(),
        createdAt: serverTimestamp(),
      });
      setSymptom('');
     Alert.alert("✨ ¡Guardado!", "¡Tu síntoma ha sido registrado con éxito! 💝")
    } catch (error) {
      Alert.alert("😔 Error", "No se pudo guardar el síntoma. Por favor, intenta de nuevo.")
    }
  };
  
  const getFetusImageSource = (week: number | null) => {
    if (week === null) return require('../../assets/images/fetus/placeholder.png');
    switch (week) {
      case 1: return require('../../assets/images/fetus/semana_1.png');
      case 2: return require('../../assets/images/fetus/semana_2.png');
      case 3: return require('../../assets/images/fetus/semana_3.png');
      case 4: return require('../../assets/images/fetus/semana_4.png');
      default: return require('../../assets/images/fetus/placeholder.png');
    }
  };

  if (loading) {
    return (
       <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#FF6B9D" />
        <ThemedText style={styles.loadingText}>✨ Cargando tu información...</ThemedText>
      </View>
    );
  }

  if (!userId) {
    return (
        <ThemedView style={[styles.container, styles.centerContent]}>
        <Text style={styles.emptyIcon}>💝</Text>
        <ThemedText style={styles.emptyText}>Por favor, inicia sesión para ver tu seguimiento de embarazo.</ThemedText>
      </ThemedView>
    )
  }

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.scrollViewContent}
      showsVerticalScrollIndicator={false}
    >

      
      {/* Fetal Development Tracking */}
      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Seguimiento del Desarrollo Fetal</ThemedText>
        {lmp && currentWeek !== null ? (
          <>
            <Image source={getFetusImageSource(currentWeek)} style={styles.fetalImage} />
            <ThemedText style={styles.weekText}>Semana Actual: {currentWeek}</ThemedText>
             <TouchableOpacity style={styles.secondaryButton} onPress={() => setShowLmpPicker(true)}>
              <Text style={styles.secondaryButtonText}>📅 Cambiar Fecha FUM</Text>
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

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>⚖️ Peso (kg)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: 65.5"
            placeholderTextColor={isDarkMode ? "#6B5B62" : "#C4A4B4"}
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>💓 Presión Arterial</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: 120/80"
            placeholderTextColor={isDarkMode ? "#6B5B62" : "#C4A4B4"}
            value={bloodPressure}
            onChangeText={setBloodPressure}
              />
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleSaveVitals}>
            <Text style={styles.primaryButtonText}>✨ Guardar Signos Vitales</Text>
          </TouchableOpacity>

        <ThemedText style={styles.listTitle}>📊 Historial</ThemedText>
        {vitalsList.length > 0 ? (
          vitalsList.map((item) => (
            <View key={item.id} style={styles.vitalsCard}>
              <View style={styles.vitalsHeader}>
                <View style={styles.vitalsBadge}>
                  <Text style={styles.vitalsBadgeIcon}>⚖️</Text>
                </View>
                <View style={styles.vitalsInfo}>
                  <Text style={styles.vitalsValue}>{item.weight} kg</Text>
                  <Text style={styles.vitalsDate}>{item.date}</Text>
                </View>
              </View>
              <View style={styles.vitalsRow}>
                <Text style={styles.vitalsLabel}>💓 Presión:</Text>
                <Text style={styles.vitalsValueSmall}>{item.bloodPressure}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyStateCard}>
            <Text style={styles.emptyStateIcon}>📋</Text>
            <Text style={styles.emptyStateTextSmall}>
              Aún no has registrado signos vitales.{"\n"}¡Comienza a monitorear tu salud!
            </Text>
          </View>
        )}
    </ThemedView>

       {/* Symptom Logging */}
      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Registro de Síntomas</ThemedText>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>💭 Describe tu síntoma</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ej: Náuseas matutinas leves..."
            placeholderTextColor={isDarkMode ? "#6B5B62" : "#C4A4B4"}
            multiline
            numberOfLines={3}
            value={symptom}
            onChangeText={setSymptom}
          />
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleSaveSymptom}>
          <Text style={styles.primaryButtonText}>✨ Guardar Síntoma</Text>
        </TouchableOpacity>

        <ThemedText style={styles.listTitle}>📋 Historial de Síntomas</ThemedText>
        {symptomsList.length > 0 ? (
          symptomsList.map((item) => (
            <View key={item.id} style={styles.symptomCard}>
              <View style={styles.symptomHeader}>
                <Text style={styles.symptomDate}>{item.date}</Text>
              </View>
              <Text style={styles.symptomText}>{item.symptom}</Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyStateCard}>
            <Text style={styles.emptyStateTextSmall}>
              No has registrado síntomas aún.{"\n"}¡Registra cómo te sientes cada día!
            </Text>
          </View>
        )}
      </ThemedView>
    </ScrollView>
  )
}

const getStyles = (isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? '#121212' : '#FFF5F8',
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 32,
  },
  symptomCard: {
      backgroundColor: isDarkMode ? "#3D3147" : "#FFF5F8",
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDarkMode ? "#6B5B62" : "#FFE4ED",
    },
    symptomHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
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
   emptyStateCard: {
      backgroundColor: isDarkMode ? "#3D3147" : "#FFF5F8",
      borderRadius: 20,
      padding: 32,
      alignItems: "center",
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDarkMode ? "#6B5B62" : "#FFE4ED",
    },
    emptyStateIcon: {
      fontSize: 48,
      marginBottom: 16,
    },
    emptyStateText: {
      fontSize: 15,
      textAlign: "center",
      color: isDarkMode ? "#D4A5C0" : "#9E7B8E",
      lineHeight: 22,
    },
    emptyStateTextSmall: {
      fontSize: 14,
      textAlign: "center",
      color: isDarkMode ? "#D4A5C0" : "#9E7B8E",
      lineHeight: 20,
    },
    sectionIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: isDarkMode ? "#3D3147" : "#FFE4ED",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
      alignSelf: "center",
    },
    sectionIcon: {
      fontSize: 28,
    },
  weekText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: isDarkMode ? Colors.dark.text : Colors.light.text,
  },
  symptomIcon: {
      fontSize: 24,
    },
    symptomDate: {
      fontSize: 13,
      color: isDarkMode ? "#D4A5C0" : "#9E7B8E",
      fontWeight: "500",
    },
    symptomText: {
      fontSize: 14,
      lineHeight: 20,
      color: isDarkMode ? "#D4A5C0" : "#6B5B62",
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
  inputContainer: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 15,
      fontWeight: "600",
      color: isDarkMode ? "#FFB6D9" : "#C62368",
      marginBottom: 8,
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
  primaryButton: {
      backgroundColor: isDarkMode ? "#B794F6" : "#FF6B9D",
      padding: 16,
      borderRadius: 20,
      alignItems: "center",
      marginBottom: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 6,
    },
    primaryButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
  secondaryButton: {
    backgroundColor: isDarkMode ? "#3D3147" : "#FFE4ED",
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: isDarkMode ? "#6B5B62" : "#FFCCE0",
  },
  secondaryButtonText: {
    color: isDarkMode ? "#FFB6D9" : "#C62368",
    fontSize: 15,
    fontWeight: "600",
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
  vitalsCard: {
      backgroundColor: isDarkMode ? "#3D3147" : "#FFF5F8",
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDarkMode ? "#6B5B62" : "#FFE4ED",
    },
    vitalsHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    vitalsBadge: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDarkMode ? "#6B5B62" : "#FFE4ED",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    vitalsBadgeIcon: {
      fontSize: 20,
    },
    vitalsInfo: {
      flex: 1,
    },
    vitalsValue: {
      fontSize: 18,
      fontWeight: "700",
      color: isDarkMode ? "#FFB6D9" : "#C62368",
      marginBottom: 4,
    },
    vitalsDate: {
      fontSize: 13,
      color: isDarkMode ? "#D4A5C0" : "#9E7B8E",
    },
    vitalsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? "#6B5B62" : "#FFE4ED",
    },
    vitalsLabel: {
      fontSize: 14,
      color: isDarkMode ? "#D4A5C0" : "#9E7B8E",
      fontWeight: "600",
    },
    vitalsValueSmall: {
      fontSize: 15,
      fontWeight: "600",
      color: isDarkMode ? "#FFB6D9" : "#C62368",
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
  emptyIcon: {
      fontSize: 64,
      marginBottom: 16,
  },
    emptyText: {
    fontSize: 16,
    textAlign: "center",
    color: isDarkMode ? "#D4A5C0" : "#9E7B8E",
    lineHeight: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: isDarkMode ? "#FFB6D9" : "#D6336C",
    fontWeight: "600",
  },
});