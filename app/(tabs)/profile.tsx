import { LoadingScreen, ProfileForm } from '@/components/profile/ProfileComponents'; // Import the components of the profile screen
import { useProfile } from '@/hooks/useProfile'; // Import the hook that handles the profile logic
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage to save authentication status locally
import { router } from 'expo-router';
import { signOut } from 'firebase/auth'; // Import function to log out of Firebase Auth
import { Alert, useColorScheme } from 'react-native';
import { auth } from '../../FireBase';


const AUTH_STATUS_KEY = 'auth_logged_in';// Import the Firebase authentication instance

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = colorScheme === 'dark' ? 'dark' : 'light';

  const {
    formData,
    edad,
    showDatePicker,
    showProvincePicker,
    showCantonPicker,
    showDistrictPicker,
    loading,
    saving,
    photoURL,
    uploadingPhoto,
    provinces,
    cantons,
    districts,
    loadingLocations,
    handleInputChange,
    handleDateChange,
    handleProvinceSelect,
    handleCantonSelect,
    handleDistrictSelect,
    handleSave,
    setShowDatePicker,
    setShowProvincePicker,
    setShowCantonPicker,
    setShowDistrictPicker,
    formatDate,
    handlePhotoChange,
  } = useProfile();

const handleSignOut = async () => {
  try {
    await signOut(auth);
    await AsyncStorage.setItem(AUTH_STATUS_KEY, 'false');

    // Resetear completamente la navegación
    router.dismissAll();
    router.replace('/');
    
  } catch (error) {
    Alert.alert('Error', 'No se pudo cerrar sesión. ' + String(error));
  }
};

  if (loading) {
    return <LoadingScreen theme={theme} />;
  }

  return (
    <ProfileForm
      theme={theme}
      formData={formData}
      edad={edad}
      showDatePicker={showDatePicker}
      showProvincePicker={showProvincePicker}
      showCantonPicker={showCantonPicker}
      showDistrictPicker={showDistrictPicker}
      saving={saving}
      photoURL={photoURL}
      uploadingPhoto={uploadingPhoto}
      provinces={provinces}
      cantons={cantons}
      districts={districts}
      loadingLocations={loadingLocations}
      onInputChange={handleInputChange}
      onDateChange={handleDateChange}
      onProvinceSelect={handleProvinceSelect}
      onCantonSelect={handleCantonSelect}
      onDistrictSelect={handleDistrictSelect}
      onSave={handleSave}
      onShowDatePicker={setShowDatePicker}
      onShowProvincePicker={setShowProvincePicker}
      onShowCantonPicker={setShowCantonPicker}
      onShowDistrictPicker={setShowDistrictPicker}
      formatDate={formatDate}
      onPhotoChange={handlePhotoChange}
      onSignOut={handleSignOut}
    />
  );
}