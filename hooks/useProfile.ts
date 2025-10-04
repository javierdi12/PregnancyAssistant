// hooks/useProfile.ts
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { db, storage } from '../FireBase';
import { Canton, District, locationService, Province } from '../services/locationService';

interface ProfileFormData {
  nombre: string;
  apellidos: string;
  fechaNacimiento: string;
  provincia?: string;
  canton?: string;
  distrito?: string;
}

export const useProfile = () => {
  const [formData, setFormData] = useState<ProfileFormData>({
    nombre: '',
    apellidos: '',
    fechaNacimiento: '',
    provincia: '',
  canton: '',
  distrito: '',
  });
  const [edad, setEdad] = useState<number | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showProvincePicker, setShowProvincePicker] = useState(false);
  const [showCantonPicker, setShowCantonPicker] = useState(false);
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cantons, setCantons] = useState<Canton[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  const auth = getAuth();
  const user = auth.currentUser;
  const router = useRouter();

  // ------------------ UTILS ------------------
  const calculateAge = (dateString: string): number => {
    const birthDate = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // ------------------ LOAD PROFILE ------------------
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
            fechaNacimiento = new Date(userData.fechaNacimiento.seconds * 1000).toISOString().split('T')[0];
          } else if (typeof userData.fechaNacimiento === 'string') {
            fechaNacimiento = userData.fechaNacimiento;
          }
        }

        setFormData({
          nombre: userData.nombre || '',
          apellidos: userData.apellidos || '',
          fechaNacimiento,
          provincia: userData.provincia || '',
          canton: userData.canton || '',
          distrito: userData.distrito || '',
        });
        if (userData.photoURL) setPhotoURL(userData.photoURL);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'No se pudo cargar la información del perfil');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) loadUserProfile();
    else {
      router.replace('/');
      setLoading(false);
    }
  }, [user]);

  // ------------------ LOCATIONS ------------------
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        setLoadingLocations(true);
        const provincesData = await locationService.getProvinces();
        setProvinces(provincesData);
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'No se pudieron cargar las provincias');
      } finally {
        setLoadingLocations(false);
      }
    };
    loadProvinces();
  }, []);

  const loadCantons = async (provinceId: string) => {
    try {
      setLoadingLocations(true);
      const cantonsData = await locationService.getCantons(provinceId);
      setCantons(cantonsData);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron cargar los cantones');
    } finally {
      setLoadingLocations(false);
    }
  };

  const loadDistricts = async (provinceId: string, cantonId: string) => {
    try {
      setLoadingLocations(true);
      const districtsData = await locationService.getDistricts(provinceId, cantonId);
      setDistricts(districtsData);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron cargar los distritos');
    } finally {
      setLoadingLocations(false);
    }
  };

  // ------------------ HANDLERS ------------------
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'provincia' && { canton: '', distrito: '' }),
      ...(field === 'canton' && { distrito: '' }),
    }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      handleInputChange('fechaNacimiento', selectedDate.toISOString().split('T')[0]);
    }
  };

  const handleProvinceSelect = async (province: Province) => {
    handleInputChange('provincia', province.name);
    setShowProvincePicker(false);
    await loadCantons(province.id);
  };

  const handleCantonSelect = async (canton: Canton) => {
    handleInputChange('canton', canton.name);
    setShowCantonPicker(false);

    const selectedProvince = provinces.find(p => p.name === formData.provincia);
    if (selectedProvince) await loadDistricts(selectedProvince.id, canton.id);
  };

  const handleDistrictSelect = (district: District) => {
    handleInputChange('distrito', district.name);
    setShowDistrictPicker(false);
  };

  const handlePhotoChange = async () => {
    if (!user) return Alert.alert('Error', 'Debes iniciar sesión para cambiar la foto');

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permisos necesarios', 'Permite acceso a la galería');

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled) return;

    setUploadingPhoto(true);
    try {
      const uri = result.assets[0].uri;
      const blob = await (await fetch(uri)).blob();
      const storageRef = ref(storage, `profilePhotos/${user.uid}`);
      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);
      setPhotoURL(url);
      await setDoc(doc(db, 'users', user.uid), { photoURL: url }, { merge: true });
      Alert.alert('Éxito', 'Foto de perfil actualizada');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo subir la foto');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // ------------------ SAVE ------------------
  const handleSave = async () => {
    if (!formData.nombre.trim() || !formData.apellidos.trim() || !formData.fechaNacimiento) {
      return Alert.alert('Error', 'Completa todos los campos obligatorios');
    }

    setSaving(true);
    try {
      const userRef = doc(db, 'users', user!.uid);
      const newEdad = calculateAge(formData.fechaNacimiento);

      await setDoc(
        userRef,
        {
          ...formData,
          nombre: formData.nombre.trim(),
          apellidos: formData.apellidos.trim(),
          edad: newEdad,
          lastUpdated: new Date(),
          ...(photoURL && { photoURL })
        },
        { merge: true }
      );
      Alert.alert('Éxito', 'Perfil guardado correctamente');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo guardar el perfil');
    } finally {
      setSaving(false);
    }
  };

  // ------------------ AGE EFFECT ------------------
  useEffect(() => {
    if (formData.fechaNacimiento) setEdad(calculateAge(formData.fechaNacimiento));
    else setEdad(null);
  }, [formData.fechaNacimiento]);

  return {
    formData,
    edad,
    showDatePicker,
    setShowDatePicker,
    provinces,
    cantons,
    districts,
    showProvincePicker,
    setShowProvincePicker,
    showCantonPicker,
    setShowCantonPicker,
    showDistrictPicker,
    setShowDistrictPicker,
    loading,
    saving,
    uploadingPhoto,
    photoURL,
    loadingLocations,
    handleInputChange,
    handleDateChange,
    handleProvinceSelect,
    handleCantonSelect,
    handleDistrictSelect,
    handlePhotoChange,
    handleSave,
    formatDate
  };
};
