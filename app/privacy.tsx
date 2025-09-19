import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage to store persistent data
import { useRouter } from 'expo-router'; // Hook for navigating between screens with Expo Router
import { useState } from 'react';
import {
  Alert,
  Modal,
  Platform, // Allows detection of iOS or Android
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
  useColorScheme, // Hook to detect light or dark theme
} from 'react-native';
import { Switch } from 'react-native-switch';

export default function PrivacyScreen() {
  const [dataUsageAccepted, setDataUsageAccepted] = useState(false);// Status to determine whether the user accepted the use of essential data
  const [personalizedAdsAccepted, setPersonalizedAdsAccepted] = useState(false); // Status to determine whether the user accepted personalized advertising
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();  // Detects whether the system is in dark or light mode

  const isDark = colorScheme === 'dark';

  const handleAcceptNecessary = () => {  // Function that accepts only necessary data (no optional advertising)
    setDataUsageAccepted(true);
    setPersonalizedAdsAccepted(false);
  };

  const handleAcceptAll = () => {  // Function that accepts all data, including optional advertising
    setDataUsageAccepted(true);
    setPersonalizedAdsAccepted(true);
  };

  const handleContinue = async () => { //Function that runs when Continue is pressed.
    if (!dataUsageAccepted) {// Validates that the essential data has been accepted; if not, displays an alert.
      Alert.alert(
        'Atención',
        'Debes aceptar el uso de datos esenciales para continuar',
        [{ text: 'Entendido' }]
      );
      return;
    }

    try {
      // Save that the terms were accepted in AsyncStorage
      await AsyncStorage.setItem('terms_accepted', 'true');
      await AsyncStorage.setItem(
        'ads_accepted',
        personalizedAdsAccepted ? 'true' : 'false'
      );

      // Redirect to home with query parameters
      router.replace('/welcome');
    } catch (error) {
      console.error('Error guardando términos:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent />

      {/* Header */}
      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#06B6D4" />
          <ThemedText style={[styles.backText, { color: '#06B6D4' }]}>Atrás</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Privacy Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="lock" size={48} color="#ffffff" />
            <View style={styles.heartContainer}>
              <FontAwesome name="heart" size={24} color="#EC4899" />
            </View>
          </View>
        </View>

        <ThemedText style={styles.title}>Hablemos de privacidad</ThemedText>

        {/* Privacy Options */}
        <View style={styles.optionsContainer}>
          {/* Data Usage */}
          <View style={styles.optionRow}>
            <View style={styles.optionTextContainer}>
              <ThemedText style={styles.optionText}>
                Acepto el uso de mis{' '}
                <ThemedText style={styles.highlightText}>datos de la aplicación</ThemedText>{' '}
                (incluido mi estado de embarazo) para recibir servicios en la aplicación.
              </ThemedText>
            </View>
            <Switch
              value={dataUsageAccepted}
              onValueChange={setDataUsageAccepted}
              activeText=""
              inActiveText=""
              circleSize={24}
              barHeight={28}
              circleBorderWidth={0}
              backgroundActive="#06B6D4"
              backgroundInactive={isDark ? '#374151' : '#e5e5e5'}
              circleActiveColor="#ffffff"
              circleInActiveColor="#ffffff"
              changeValueImmediately
            />
          </View>

          {/* Personalized Ads */}
          <View style={styles.optionRow}>
            <View style={styles.optionTextContainer}>
              <ThemedText style={styles.optionText}>
                Acepto recibir{' '}
                <ThemedText style={styles.highlightText}>publicidad personalizada</ThemedText>{' '}
                en la aplicación (opcional).
              </ThemedText>
            </View>
            <Switch
              value={personalizedAdsAccepted}
              onValueChange={setPersonalizedAdsAccepted}
              activeText=""
              inActiveText=""
              circleSize={24}
              barHeight={28}
              circleBorderWidth={0}
              backgroundActive="#06B6D4"
              backgroundInactive={isDark ? '#374151' : '#e5e5e5'}
              circleActiveColor="#ffffff"
              circleInActiveColor="#ffffff"
              changeValueImmediately
            />
          </View>
        </View>

        {/* Privacy Policy Link */}
        <ThemedText style={styles.privacyText}>
          Para más información, consulte nuestra{' '}
          <ThemedText
            style={styles.privacyLink}
            onPress={() => setShowPrivacyModal(true)}
          >
            política de privacidad
          </ThemedText>
          .
        </ThemedText>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.necessaryButton]}
              onPress={handleAcceptNecessary}
            >
              <ThemedText style={styles.necessaryButtonText}>Aceptar lo necesario</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.allButton]}
              onPress={handleAcceptAll}
            >
              <ThemedText style={styles.allButtonText}>Aceptar todo</ThemedText>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <ThemedText style={styles.continueText}>Continuar</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal */}
      <Modal
        visible={showPrivacyModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <View style={styles.modalBackground}>
          <ThemedView style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Política de Privacidad</ThemedText>
            <ScrollView>
              <ThemedText style={styles.modalText}>
                1. Recopilación de datos{"\n"}
                Recopilamos únicamente los datos necesarios para brindarte nuestros servicios, como información sobre tu estado de embarazo, preferencias y uso de la aplicación. No compartimos tus datos con terceros sin tu consentimiento.
                {"\n"}
                2. Uso de la información{"\n"}
                La información recopilada se utiliza exclusivamente para mejorar la experiencia dentro de la aplicación, ofrecer contenidos personalizados y enviarte notificaciones relevantes. La publicidad personalizada es opcional y puedes activarla o desactivarla en cualquier momento.
                {"\n"}
                3. Seguridad de los datos{"\n"}
                Todos los datos sensibles se almacenan de manera segura.
                {"\n"}
                4. Acceso y control{"\n"}
                Tienes derecho a acceder, corregir tus datos personales en cualquier momento. Puedes hacerlo desde la configuración de tu cuenta.
                {"\n"}
                5. Actualizaciones de la política{"\n"}
                Podemos actualizar esta política para mejorar la seguridad o cumplir con nuevas regulaciones. Te notificaremos sobre cambios importantes y siempre tendrás acceso a la versión actualizada dentro de la aplicación.
          </ThemedText>
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowPrivacyModal(false)}
            >
              <ThemedText style={styles.closeButtonText}>Cerrar</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </View>
      </Modal>

      {/* Home Indicator */}
      {Platform.OS === 'ios' && (
        <ThemedView style={styles.homeIndicator}>
          <View
            style={[
              styles.homeIndicatorBar,
              { backgroundColor: isDark ? '#9ca3af' : '#000000' },
            ]}
          />
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, borderBottomWidth: 1 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  backText: { fontWeight: '500', marginLeft: 8, fontSize: 16 },
  scrollContent: { flexGrow: 1, padding: 24, paddingBottom: 50, justifyContent: 'center' },
  iconContainer: { alignItems: 'center', marginBottom: 90 },
  iconCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#fbcfe8',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  heartContainer: { position: 'absolute', bottom: -4, left: '50%', transform: [{ translateX: -12 }] },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 32, lineHeight: 32 },
  optionsContainer: { gap: 24, marginBottom: 32 },
  optionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  optionTextContainer: { flex: 1 },
  optionText: { fontSize: 16, lineHeight: 24 },
  highlightText: { color: '#06B6D4', fontWeight: '500' },
  privacyText: { fontSize: 14, textAlign: 'center', marginBottom: 110, lineHeight: 20 },
  privacyLink: { color: '#06B6D4', fontWeight: '500', textDecorationLine: 'underline' },
  buttonsContainer: { gap: 16 },
  buttonRow: { flexDirection: 'row', gap: 12 },
  button: { flex: 1, padding: 11, borderRadius: 12, alignItems: 'center', justifyContent: 'center', minHeight: 50 },
  necessaryButton: { backgroundColor: '#cffafe', borderWidth: 1, borderColor: '#a5f3fc' },
  allButton: { backgroundColor: '#06B6D4' },
  necessaryButtonText: { color: '#0891b2', fontWeight: '600', fontSize: 14 },
  allButtonText: { color: '#ffffff', fontWeight: '600', fontSize: 14 },
  continueButton: { padding: 20, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  continueText: { fontWeight: '500', fontSize: 14 },
  homeIndicator: { padding: 16, alignItems: 'center', justifyContent: 'center' },
  homeIndicatorBar: { width: 128, height: 4, borderRadius: 2 },
  modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { borderRadius: 12, padding: 20, width: '100%', maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  modalText: { fontSize: 14, lineHeight: 20, marginBottom: 20 },
  closeButton: { backgroundColor: '#06B6D4', padding: 12, borderRadius: 8, alignItems: 'center' },
  closeButtonText: { color: '#fff', fontWeight: '600' },
});
