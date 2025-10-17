import * as ImagePicker from 'expo-image-picker'; // Import the module to select images from the device gallery
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth'; // Import Firebase authentication functions
import { doc, getDoc, setDoc } from 'firebase/firestore'; // Import Firestore functions to read and write documents
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'; // Import Firebase Storage functions to upload and retrieve images
import { useCallback, useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { db, storage } from '../FireBase';
import { Canton, District, locationService, Province } from '../services/locationService'; // Import types and location service (provinces, cantons, districts)

interface ProfileFormData {
  nombre: string;
  apellidos: string;
  fechaNacimiento: string;
  provincia?: string;
  canton?: string;
  distrito?: string;
}

export const useProfile = () => {// Custom hook to handle user profile logic
  const [formData, setFormData] = useState<ProfileFormData>({
    nombre: '',
    apellidos: '',
    fechaNacimiento: '',
    provincia: '',
  canton: '',
  distrito: '',
  });
  const [edad, setEdad] = useState<number | null>(null); // Status for calculated age
  const [showDatePicker, setShowDatePicker] = useState(false);// Show date picker
  const [showProvincePicker, setShowProvincePicker] = useState(false);// Show province selector
  const [showCantonPicker, setShowCantonPicker] = useState(false);// Show canton selector
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);// Show district selector
  const [loading, setLoading] = useState(true); // Profile loading status
  const [saving, setSaving] = useState(false);// Profile saving status
  const [photoURL, setPhotoURL] = useState<string | null>(null);// Profile photo URL
  const [uploadingPhoto, setUploadingPhoto] = useState(false);// Photo upload status

   // States for locations (provinces, cantons, districts)
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cantons, setCantons] = useState<Canton[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);// Location load status

   // ------------------ AUTHENTICATION AND BROWSING ------------------
  const auth = getAuth();
  const user = auth.currentUser;
  const router = useRouter();

  // ------------------ UTILS ------------------
  const calculateAge = (dateString: string): number => { // Function to calculate age from date of birth
    const birthDate = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const formatDate = (dateString: string) => {  // Format the date to DD/MM/YYYY to display on the form
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
      setLoading(false);// If there is no user, end the upload
      return;
    }
    try {
      const docRef = doc(db, 'users', user.uid);// Reference to the user document
      const docSnap = await getDoc(docRef);// Get document data

      if (docSnap.exists()) {
        const userData = docSnap.data();
        let fechaNacimiento = ''; // Special date handling (can come as a timestamp or string)
        if (userData.fechaNacimiento) {
          if (typeof userData.fechaNacimiento === 'object' && 'seconds' in userData.fechaNacimiento) {
            fechaNacimiento = new Date(userData.fechaNacimiento.seconds * 1000).toISOString().split('T')[0];
          } else if (typeof userData.fechaNacimiento === 'string') {
            fechaNacimiento = userData.fechaNacimiento;
          }
        }

        setFormData({
          nombre: userData.nombre || '', // Updates the form states with the user's data
          apellidos: userData.apellidos || '',
          fechaNacimiento,
          provincia: userData.provincia || '',
          canton: userData.canton || '',
          distrito: userData.distrito || '',
        });
        if (userData.photoURL) setPhotoURL(userData.photoURL); // If there is a profile photo, upload it
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
    const loadProvinces = async () => { // Load provinces on startup
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

   // Load cantons according to selected province
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

// Load districts according to selected province and county
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
  const handleInputChange = (field: string, value: string) => { // Handles changes in form fields
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'provincia' && { canton: '', distrito: '' }),// Clear canton and district if province changes
      ...(field === 'canton' && { distrito: '' }), // Clear district if county changes
    }));
  };

   // Handles birth date selection
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      handleInputChange('fechaNacimiento', selectedDate.toISOString().split('T')[0]);
    }
  };

  const handleProvinceSelect = async (province: Province) => { // Handles province selection
    handleInputChange('provincia', province.name);
    setShowProvincePicker(false);
    await loadCantons(province.id); // Load cantons for the selected province
  };

  const handleCantonSelect = async (canton: Canton) => { // Handles county selection
    handleInputChange('canton', canton.name);
    setShowCantonPicker(false);

    const selectedProvince = provinces.find(p => p.name === formData.provincia);
    if (selectedProvince) await loadDistricts(selectedProvince.id, canton.id); // Load districts for the selected county
  };

  const handleDistrictSelect = (district: District) => { // Handles district selection
    handleInputChange('distrito', district.name);
    setShowDistrictPicker(false);
  };


   // ------------------ PROFILE PICTURE ------------------
  const handlePhotoChange = async () => {
    if (!user) return Alert.alert('Error', 'Debes iniciar sesión para cambiar la foto');

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync(); // Request permissions to access the gallery
    if (status !== 'granted') return Alert.alert('Permisos necesarios', 'Permite acceso a la galería');

    const result = await ImagePicker.launchImageLibraryAsync({// Open image selector
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled) return;

    setUploadingPhoto(true);
    try {
      const uri = result.assets[0].uri;
      const blob = await (await fetch(uri)).blob();// Convert image to blob
      const storageRef = ref(storage, `profilePhotos/${user.uid}`);
      await uploadBytes(storageRef, blob);// Upload image
      const url = await getDownloadURL(storageRef);// Get public URL
      setPhotoURL(url);// Save URL in status
      await setDoc(doc(db, 'users', user.uid), { photoURL: url }, { merge: true });// Save URL in Firestore
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
    // Validation of required fields
    if (!formData.nombre.trim() || !formData.apellidos.trim() || !formData.fechaNacimiento) {
      return Alert.alert('Error', 'Completa todos los campos obligatorios');
    }

    setSaving(true);
    try {
      const userRef = doc(db, 'users', user!.uid);
      const newEdad = calculateAge(formData.fechaNacimiento);// Calculate age

      await setDoc( // Save data in Firestore, merge = true to avoid overwriting other fields
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

  // ------------------ Return HOOK ------------------
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
