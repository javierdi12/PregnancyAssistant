import { getProfileStyles } from '@/styles/profile';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ProfileFormProps {
  theme: 'light' | 'dark';
  formData: {
    nombre: string;
    apellidos: string;
    fechaNacimiento: string;
    provincia: string;
    canton: string;
    distrito: string;
  };
  edad: number | null;
  showDatePicker: boolean;
  saving: boolean;
  onInputChange: (field: string, value: string) => void;
  onDateChange: (event: any, selectedDate?: Date) => void;
  onSave: () => void;
  onShowDatePicker: (show: boolean) => void;
  formatDate: (dateString: string) => string;
}

export const ProfileForm = ({
  theme,
  formData,
  edad,
  showDatePicker,
  saving,
  onInputChange,
  onDateChange,
  onSave,
  onShowDatePicker,
  formatDate,
}: ProfileFormProps) => {
  const styles = getProfileStyles(theme);
  const router = useRouter();

  const navigateToHelpCenter = () => router.push('/help-center');
  const navigateToContact = () => router.push('/contact');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.header}>
          <Text style={styles.title}>Detalles de la cuenta</Text>
        </View>

        <View style={styles.formSection}>
          {/* Nombre */}
          <View style={styles.inputRow}>
            <Text style={styles.label}>Nombre:</Text>
            <TextInput
              style={styles.input}
              value={formData.nombre}
              onChangeText={(value) => onInputChange('nombre', value)}
              placeholder="Escribe aqui.."
              placeholderTextColor={theme === 'dark' ? '#888' : '#999'}
            />
          </View>

          {/* Apellidos */}
          <View style={styles.inputRow}>
            <Text style={styles.label}>Apellidos:</Text>
            <TextInput
              style={styles.input}
              value={formData.apellidos}
              onChangeText={(value) => onInputChange('apellidos', value)}
              placeholder="Escribe aquí..."
              placeholderTextColor={theme === 'dark' ? '#888' : '#999'}
            />
          </View>

          {/* Fecha de nacimiento */}
          <View style={styles.inputRow}>
            <Text style={styles.label}>Fecha de nacimiento:</Text>
            <TouchableOpacity style={styles.dateButton} onPress={() => onShowDatePicker(true)}>
              <Text style={styles.dateText}>
                {formData.fechaNacimiento ? formatDate(formData.fechaNacimiento) : 'Seleccionar fecha'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={formData.fechaNacimiento ? new Date(formData.fechaNacimiento) : new Date()}
                mode="date"
                display="default"
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>

          {/* Edad */}
          <View style={styles.inputRow}>
            <Text style={styles.label}>Edad:</Text>
            <Text style={styles.ageText}>{edad !== null ? edad : ''}</Text>
          </View>
         {/* Provincia */}
          <View style={styles.inputRow}>
            <Text style={styles.label}>Provincia:</Text>
            <TextInput
              style={styles.input}
              value={formData.provincia}
              onChangeText={(value) => onInputChange('provincia', value)}
              placeholder="Provincia"
              placeholderTextColor={theme === 'dark' ? '#888' : '#999'}
            />
          </View>

          {/* Cantón */}
          <View style={styles.inputRow}>
            <Text style={styles.label}>Cantón:</Text>
            <TextInput
              style={styles.input}
              value={formData.canton}
              onChangeText={(value) => onInputChange('canton', value)}
              placeholder="Cantón"
              placeholderTextColor={theme === 'dark' ? '#888' : '#999'}
            />
          </View>

          {/* Distrito */}
          <View style={styles.inputRow}>
            <Text style={styles.label}>Distrito:</Text>
            <TextInput
              style={styles.input}
              value={formData.distrito}
              onChangeText={(value) => onInputChange('distrito', value)}
              placeholder="Distrito"
              placeholderTextColor={theme === 'dark' ? '#888' : '#999'}
            />
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
        <TouchableOpacity style={styles.saveButton} onPress={onSave} disabled={saving}>
          <Text style={styles.saveButtonText}>{saving ? 'Guardando...' : 'Guardar cambios'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

interface LoadingScreenProps {
  theme: 'light' | 'dark';
}

export const LoadingScreen = ({ theme }: LoadingScreenProps) => {
  const styles = getProfileStyles(theme);
  
  return (
    <SafeAreaView style={styles.loadingContainer}>
      <Text style={{ color: theme === 'dark' ? '#fff' : '#000' }}>Cargando perfil...</Text>
    </SafeAreaView>
  );
};