import { LoadingScreen, ProfileForm } from '@/components/profile/ProfileComponents';
import { useProfile } from '@/hooks/useProfile';
import { useColorScheme } from 'react-native';

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
    />
  );
}