import { Canton, District, Province } from '@/services/locationService';
import { getProfileStyles } from '@/styles/profile';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';



interface ProfileFormProps {
  theme: 'light' | 'dark';
  formData: {
    nombre: string;
    apellidos: string;
    fechaNacimiento: string;
    provincia?: string;
    canton?: string;
    distrito?: string;
  };
  edad: number | null;
  showDatePicker: boolean;
  showProvincePicker: boolean;
  showCantonPicker: boolean;
  showDistrictPicker: boolean;
  saving: boolean;
  photoURL: string | null;
  uploadingPhoto: boolean;
  provinces: Province[];
  cantons: Canton[];
  districts: District[];
  loadingLocations: boolean;
  onInputChange: (field: string, value: string) => void;
  onDateChange: (event: any, selectedDate?: Date) => void;
  onProvinceSelect: (province: Province) => void;
  onCantonSelect: (canton: Canton) => void;
  onDistrictSelect: (district: District) => void;
  onSave: () => void;
  onShowDatePicker: (show: boolean) => void;
  onShowProvincePicker: (show: boolean) => void;
  onShowCantonPicker: (show: boolean) => void;
  onShowDistrictPicker: (show: boolean) => void;
  formatDate: (dateString: string) => string;
  onPhotoChange: () => void;
  onSignOut: () => void;
}

export const ProfileForm = ({
  theme,
  formData,
  edad,
  showDatePicker,
  showProvincePicker,
  showCantonPicker,
  showDistrictPicker,
  saving,
  photoURL,
  uploadingPhoto,
  provinces,
  cantons,
  districts,
  loadingLocations,
  onInputChange,
  onDateChange,
  onProvinceSelect,
  onCantonSelect,
  onDistrictSelect,
  onSave,
  onShowDatePicker,
  onShowProvincePicker,
  onShowCantonPicker,
  onShowDistrictPicker,
  formatDate,
  onPhotoChange,
  onSignOut,
}: ProfileFormProps) => {
  const styles = getProfileStyles(theme);

  const handleHelpPress = () => {
    Alert.alert(
      '💝 Ayuda rapida', 
      '✨ Verifica tu correo para activar la cuenta.\n🌸 Completa tu perfil para personalizar la app.\n💕 Registra tus controles en la seccion de Seguimiento.');
  };

  const handleContactPress = async () => {
    const supportEmail = 'pregnancyassistant9@gmail.com';
    const subject = encodeURIComponent('Soporte Pregnancy Assistant');
    const mailto = `mailto:${supportEmail}?subject=${subject}`;

    try {
      const canOpen = await Linking.canOpenURL(mailto);
      if (canOpen) {
        await Linking.openURL(mailto);
        return;
      }
    } catch (error) {
      console.error('Error opening mail client:', error);
    }

    Alert.alert('💌 Contacto', `Puedes escribirnos a ${supportEmail}`);
  };
  const renderProvinceItem = ({ item }: { item: Province }) => (
    <TouchableOpacity
      style={styles.locationItem}
      onPress={() => onProvinceSelect(item)}
    >
      <Text style={[
        styles.locationItemText,
        formData.provincia === item.name && styles.selectedLocationText
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderCantonItem = ({ item }: { item: Canton }) => (
    <TouchableOpacity
      style={styles.locationItem}
      onPress={() => onCantonSelect(item)}
    >
      <Text style={[
        styles.locationItemText,
        formData.canton === item.name && styles.selectedLocationText
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderDistrictItem = ({ item }: { item: District }) => (
    <TouchableOpacity
      style={styles.locationItem}
      onPress={() => onDistrictSelect(item)}
    >
      <Text style={[
        styles.locationItemText,
        formData.distrito === item.name && styles.selectedLocationText
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const LocationPickerModal = ({ 
    visible, 
    title, 
    data, 
    loading, 
    onClose, 
    renderItem 
  }: {
    visible: boolean;
    title: string;
    data: any[];
    loading: boolean;
    onClose: () => void;
    renderItem: any;
  }) => (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent,
          { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }
        ]}>
          <Text style={[
            styles.modalTitle,
            { color: theme === 'dark' ? '#fff' : '#000' }
          ]}>
            {title}
          </Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF6B9D" />
              <Text style={styles.loadingText}>Cargando...</Text>
            </View>
          ) : (
            <FlatList
              data={data}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              style={styles.locationList}
              showsVerticalScrollIndicator={false}
            />
          )}
          
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={onClose}
          >
            <Text style={styles.modalCloseText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.header}>
          <Text style={styles.title}>✨ Mi Perfil ✨</Text>
          <Text style={styles.subtitle}>Cuéntanos más sobre ti</Text>
        </View>

        {/* Foto de perfil */}
        <View style={styles.profilePhotoSection}>
          <View style={styles.profilePhotoContainer}>
            <Image
              source={
                photoURL 
                  ? { uri: photoURL }
                  : require('@/assets/images/default-avatar.png')
              }
              style={styles.profilePhoto}
            />
            <TouchableOpacity 
              style={styles.changePhotoButton}
              onPress={onPhotoChange}
              disabled={uploadingPhoto}
            >
              {uploadingPhoto ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.changePhotoText}>📷</Text>
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.photoPlaceholderText}>
            {uploadingPhoto ? 'Subiendo foto...' : 'Toca para la cámara para cambiar la foto'}
          </Text>
        </View>
        
        <View style={styles.formSection}>
          {/* Nombre */}
          <View style={styles.inputRow}>
            <Text style={styles.label}>💝 Nombre:</Text>
            <TextInput
              style={styles.input}
              value={formData.nombre}
              onChangeText={(value) => onInputChange('nombre', value)}
              placeholder="Escribe aquí..."
              placeholderTextColor={theme === 'dark' ? '#888' : '#C4A4B4'}
            />
          </View>

          {/* Apellidos */}
          <View style={styles.inputRow}>
            <Text style={styles.label}>🌸 Apellidos:</Text>
            <TextInput
              style={styles.input}
              value={formData.apellidos}
              onChangeText={(value) => onInputChange('apellidos', value)}
              placeholder="Tus apellidos.."
              placeholderTextColor={theme === 'dark' ? '#888' : '#C4A4B4'}
            />
          </View>

          {/* Fecha de nacimiento */}
          <View style={styles.inputRow}>
            <Text style={styles.label}>🎂 Fecha de nacimiento:</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => onShowDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {formData.fechaNacimiento
                  ? formatDate(formData.fechaNacimiento)
                  : 'Seleccionar fecha'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={
                  formData.fechaNacimiento
                    ? new Date(formData.fechaNacimiento)
                    : new Date()
                }
                mode="date"
                display="default"
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>

          {/* Edad */}
          {edad !== null && (
            <View style={styles.inputRow}>
              <Text style={styles.label}>✨ Edad</Text>
              <Text style={styles.ageText}>
                {edad} años
              </Text>
            </View>
          )}

          {/* Provincia */}
          <View style={styles.inputRow}>
            <Text style={styles.label}>📍 Provincia:</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => onShowProvincePicker(true)}
            >
              <Text style={styles.dateText}>
                {formData.provincia || 'Seleccionar provincia'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Cantón */}
          <View style={styles.inputRow}>
            <Text style={styles.label}>🏘️ Cantón:</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => {
                if (!formData.provincia) {
                 Alert.alert('💭', 'Por favor selecciona una provincia primero');
                  return;
                }
                onShowCantonPicker(true);
              }}
              disabled={!formData.provincia}
            >
              <Text style={[
                styles.dateText,
                !formData.provincia && styles.disabledText
              ]}>
                {formData.canton || 'Seleccionar cantón'}
              </Text>
            </TouchableOpacity>
          </View>
          {/* Distrito */}
          <View style={styles.inputRow}>
            <Text style={styles.label}>🏡 Distrito:</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => {
                if (!formData.canton) {
                  Alert.alert('💭', 'Por favor selecciona un cantón primero');
                  return;
                }
                onShowDistrictPicker(true);
              }}
              disabled={!formData.canton}
            >
              <Text style={[
                styles.dateText,
                !formData.canton && styles.disabledText
              ]}>
                {formData.distrito || 'Seleccionar distrito'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Location selection manners */}
        <LocationPickerModal
          visible={showProvincePicker}
          title="📍 Seleccionar Provincia"
          data={provinces}
          loading={loadingLocations}
          onClose={() => onShowProvincePicker(false)}
          renderItem={renderProvinceItem}
        />

        <LocationPickerModal
          visible={showCantonPicker}
          title="🏘️ Seleccionar Cantón"
          data={cantons}
          loading={loadingLocations}
          onClose={() => onShowCantonPicker(false)}
          renderItem={renderCantonItem}
        />

        <LocationPickerModal
          visible={showDistrictPicker}
          title="🏡 Seleccionar Distrito"
          data={districts}
          loading={loadingLocations}
          onClose={() => onShowDistrictPicker(false)}
          renderItem={renderDistrictItem}
        />

        {/* Divider */}
        <View style={styles.divider} />

        {/* Help section */}
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>💕 Ayuda y soporte</Text>

          <TouchableOpacity style={styles.helpButton} onPress={handleHelpPress}>
            <Text style={styles.helpText}>💡 Guia rapida de la app</Text>
            <Text style={styles.arrow}>?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.helpButton} onPress={handleContactPress}>
            <Text style={styles.helpText}>💌 Escribir a soporte</Text>
            <Text style={styles.arrow}>{'>'}</Text>
          </TouchableOpacity>

          <Text style={styles.contactEmail}>pregnancyassistant9@gmail.com</Text>
        </View>

        {/* Save */}
        <TouchableOpacity style={styles.saveButton} onPress={onSave} disabled={saving}>
          <Text style={styles.saveButtonText}>{saving ? '💫 Guardando...' : '✨ Guardar cambios'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={onSignOut}>
          <Text style={styles.logoutButtonText}>🚪Cerrar sesion</Text>
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
      <ActivityIndicator size="large" color="#FF6B9D" />
      <Text style={styles.loadingScreenText}>✨ Cargando tu perfil...</Text>
    </SafeAreaView>
  );
};

