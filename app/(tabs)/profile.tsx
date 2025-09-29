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
    loading,
    saving,
    handleInputChange,
    handleDateChange,
    handleSave,
    setShowDatePicker,
    formatDate,
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
      saving={saving}
      onInputChange={handleInputChange}
      onDateChange={handleDateChange}
      onSave={handleSave}
      onShowDatePicker={setShowDatePicker}
      formatDate={formatDate}
    />
  );
}