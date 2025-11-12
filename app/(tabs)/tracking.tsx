import DateTimePicker from '@react-native-community/datetimepicker';
import { onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
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
import { getStyles } from '../../styles/tracking.styles';
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
