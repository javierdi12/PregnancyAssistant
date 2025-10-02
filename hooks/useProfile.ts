import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { db } from '../FireBase';

interface ProfileFormData {
  nombre: string;
  apellidos: string;
  fechaNacimiento: string;
}

export const useProfile = () => {
  const [formData, setFormData] = useState<ProfileFormData>({
    nombre: '',
    apellidos: '',
    fechaNacimiento: '',
  });
  const [edad, setEdad] = useState<number | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const auth = getAuth();
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

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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

        setFormData({
          nombre: userData.nombre || '',
          apellidos: userData.apellidos || '',
          fechaNacimiento,
        });
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

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      handleInputChange('fechaNacimiento', selectedDate.toISOString().split('T')[0]);
    }
  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesión para guardar tu perfil');
      return;
    }

    if (!formData.nombre.trim() || !formData.apellidos.trim() || !formData.fechaNacimiento.trim()) {
      Alert.alert('Campos incompletos', 'Debes llenar todos los campos: Nombre, Apellidos y Fecha de nacimiento');
      return;
    }

    const nombreConNumeros = /\d/.test(formData.nombre);
    const apellidosConNumeros = /\d/.test(formData.apellidos);

    if (nombreConNumeros || apellidosConNumeros) {
      Alert.alert(
        'Datos inválidos',
        'Los campos Nombre y Apellidos no pueden contener números'
      );
      return;
    }

    setSaving(true);
    try {
      const displayName = `${formData.nombre} ${formData.apellidos}`;
      await setDoc(
        doc(db, 'users', user.uid),
        { ...formData, edad, displayName, lastUpdated: new Date() },
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

  return {
    formData,
    edad,
    showDatePicker,
    loading,
    saving,
    handleInputChange,
    handleDateChange,
    handleSave,
    setShowDatePicker,
    formatDate,
  };
};