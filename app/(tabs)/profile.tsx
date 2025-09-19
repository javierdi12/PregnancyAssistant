import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage to store data locally on the device
import DateTimePicker from '@react-native-community/datetimepicker'; // Import AsyncStorage to store data locally on the device
import * as Location from 'expo-location'; // Import Expo location functions
import { router } from 'expo-router';
import { getAuth } from 'firebase/auth'; // Import Firebase authentication functions
import { doc, getDoc, setDoc } from 'firebase/firestore'; // Import functions to access Firestore
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView, // For scrollable content
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../FireBase'; // Import the reference to the Firestore database

interface Ubicacion { // Defines the interface for the location
  provincia: string;
  canton: string;
  distrito: string;
  calle?: string;
}

const ProfileForm = () => { // Main component of the profile form
  const colorScheme = useColorScheme() ?? 'light';
  const styles = getStyles(colorScheme);

  const [formData, setFormData] = useState({ // Status for saving form data
    nombre: '',
    apellidos: '',
    fechaNacimiento: '',
  });

  const [edad, setEdad] = useState<number | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ubicacion, setUbicacion] = useState<Ubicacion | null>(null);

  const auth = getAuth();  // Gets the currently authenticated user
  const user = auth.currentUser;

  // Calculate age
  useEffect(() => {
    if (formData.fechaNacimiento) {
      const birthDate = new Date(formData.fechaNacimiento);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      setEdad(calculatedAge);
    } else {
      setEdad(null);
    }
  }, [formData.fechaNacimiento]);

  const formatDate = (dateString: string) => { // Function to format the date
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Get location
  const getCurrentLocation = async () => {
    try {
       // Request permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'No se pudo acceder a la ubicación');
        return;
      }
       // Obtains coordinates
      const loc = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync(loc.coords);// Convert coordinates to address

      if (address.length > 0) {
        const addr = address[0];
        const provincia = addr.region || '';
        const canton = addr.city || addr.subregion || '';
        const distrito = addr.district || addr.name || '';
        const calle = addr.street || addr.streetNumber || '';

        setUbicacion({
          provincia,
          canton,
          distrito,
          calle,
        });
      }
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      Alert.alert('Error', 'No se pudo obtener la ubicación');
    }
  };

  // Load profile
  const loadUserProfile = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();

        let fechaNacimiento = '';
        if (userData.fechaNacimiento) {
          if (typeof userData.fechaNacimiento === 'object' && 'seconds' in userData.fechaNacimiento) {
            const date = new Date(userData.fechaNacimiento.seconds * 1000);
            fechaNacimiento = date.toISOString().split('T')[0];
          } else if (typeof userData.fechaNacimiento === 'string') {
            fechaNacimiento = userData.fechaNacimiento;
          }
        }

        // Sets the form data
        setFormData({
          nombre: userData.nombre || '',
          apellidos: userData.apellidos || '',
          fechaNacimiento,
        });

        // If location is available, use it; if not, obtain it
        if (userData.ubicacion) {
          setUbicacion(userData.ubicacion);
        } else {
          getCurrentLocation();
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'No se pudo cargar la información del perfil');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    } else {
      router.replace('/');
      setLoading(false);
    }
  }, [user, loadUserProfile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => { // Handles changes to the selected date
    setShowDatePicker(Platform.OS === 'ios'); // iOS keeps the picker visible
    if (selectedDate) {
      handleInputChange('fechaNacimiento', selectedDate.toISOString().split('T')[0]);
    }
  };


 // Function to save the profile in Firestore
  const handleSave = async () => {
    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesión para guardar tu perfil');
      return;
    }

    // Validate required fields
  if (!formData.nombre.trim() || !formData.apellidos.trim() || !formData.fechaNacimiento.trim()) {
    Alert.alert('Campos incompletos', 'Debes llenar todos los campos: Nombre, Apellidos y Fecha de nacimiento');
    return;
  }

  // Validate that first and last names do not contain numbers
  const nombreConNumeros = /\d/.test(formData.nombre);
  const apellidosConNumeros = /\d/.test(formData.apellidos);

  if (nombreConNumeros || apellidosConNumeros) {
    Alert.alert(
      'Datos inválidos',
      'Los campos Nombre y Apellidos no pueden contener números'
    );
    return;
  }

    setSaving(true); // Indicate that it is saving
    try {
      await setDoc(
        doc(db, 'users', user.uid),
        { ...formData, edad, ubicacion, lastUpdated: new Date() }, // Data to save
        { merge: true }
      );
      await AsyncStorage.setItem('profile_completed', 'true');
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'No se pudo guardar la información del perfil');
    } finally {
      setSaving(false);
    }
  };

  const navigateToHelpCenter = () => router.push('/help-center');
  const navigateToContact = () => router.push('/contact');

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text>Cargando perfil...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.header}>
          <Text style={styles.title}>Detalles de la cuenta</Text>
        </View>

        <View style={styles.formSection}>
          {/* name */}
          <View style={styles.inputRow}>
            <Text style={styles.label}>Nombre:</Text>
            <TextInput
              style={styles.input}
              value={formData.nombre}
              onChangeText={(value) => handleInputChange('nombre', value)}
              placeholder="Escribe aqui.."
            />
          </View>

          {/* lastname */}
          <View style={styles.inputRow}>
            <Text style={styles.label}>Apellidos:</Text>
            <TextInput
              style={styles.input}
              value={formData.apellidos}
              onChangeText={(value) => handleInputChange('apellidos', value)}
              placeholder="Escribe aquí..."
            />
          </View>

          {/* date of birth */}
          <View style={styles.inputRow}>
            <Text style={styles.label}>Fecha de nacimiento:</Text>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateText}>
                {formData.fechaNacimiento ? formatDate(formData.fechaNacimiento) : 'Seleccionar fecha'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={formData.fechaNacimiento ? new Date(formData.fechaNacimiento) : new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>

          {/* Age */}
          <View style={styles.inputRow}>
            <Text style={styles.label}>Edad:</Text>
            <Text style={styles.ageText}>{edad !== null ? edad : ''}</Text>
          </View>

          {/* Location */}
          <View style={styles.inputRow}>
            <Text style={styles.label}>Ubicación:</Text>
            <Text style={styles.ageText}>
              {ubicacion
                ? [
                    ubicacion.provincia,
                    ubicacion.canton,
                    ubicacion.distrito,
                    ubicacion.calle && ubicacion.calle !== ubicacion.distrito ? ubicacion.calle : null
                  ]
                    .filter(Boolean) // // Remove empty values
                    .join(', ')
                : 'No disponible'}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Help section */}
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Ayuda</Text>

          <TouchableOpacity style={styles.helpButton} onPress={navigateToHelpCenter}>
            <Text style={styles.helpText}>Centro de ayuda</Text>
            <Text style={styles.arrow}>{'>'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.helpButton} onPress={navigateToContact}>
            <Text style={styles.helpText}>Contacto</Text>
            <Text style={styles.arrow}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        {/* Save */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveButtonText}>{saving ? 'Guardando...' : 'Guardar cambios'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (theme: 'light' | 'dark') => // Function to define dynamic styles according to the theme
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme === 'dark' ? '#121212' : '#fff' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { padding: 20, paddingBottom: 10 },
    title: { fontSize: 24, fontWeight: 'bold', color: theme === 'dark' ? '#fff' : '#1f2937', textAlign: 'center' },
    formSection: { paddingHorizontal: 20 },
    inputRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme === 'dark' ? '#333' : '#e5e7eb' },
    label: { fontSize: 16, fontWeight: '500', color: theme === 'dark' ? '#fff' : '#374151', width: '40%' },
    input: { flex: 1, textAlign: 'right', fontSize: 16, color: theme === 'dark' ? '#ddd' : '#6b7280', padding: 8 },
    dateButton: { flex: 1, alignItems: 'flex-end' },
    dateText: { fontSize: 16, color: theme === 'dark' ? '#ddd' : '#6b7280', textAlign: 'right' },
    ageText: { fontSize: 16, color: theme === 'dark' ? '#ddd' : '#6b7280', textAlign: 'right', flex: 1 },
    divider: { height: 1, backgroundColor: theme === 'dark' ? '#333' : '#e5e7eb', marginVertical: 20 },
    helpSection: { marginTop: 20, paddingHorizontal: 20 },
    helpTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center', color: theme === 'dark' ? '#fff' : '#1f2937' },
    helpButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme === 'dark' ? '#1f1f1f' : '#f3f4f6', paddingVertical: 14, paddingHorizontal: 12, borderRadius: 8, marginBottom: 12 },
    helpText: { fontSize: 16, color: theme === 'dark' ? '#fff' : '#1f2937' },
    arrow: { fontSize: 18, color: theme === 'dark' ? '#888' : '#9ca3af', fontWeight: 'bold' },
    saveButton: { backgroundColor: '#3b82f6', padding: 16, borderRadius: 12, margin: 20, marginTop: 30, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  });

export default ProfileForm;
