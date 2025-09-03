import { ThemedText } from '@/components/ThemedText';
import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { Switch } from 'react-native-switch';

export default function PrivacyScreen() {
  const [dataUsageAccepted, setDataUsageAccepted] = useState(false);
  const [personalizedAdsAccepted, setPersonalizedAdsAccepted] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme(); 

  
  const isDark = colorScheme === 'dark';
  const colors = {
    background: isDark ? '#111827' : '#f9fafb',
    card: isDark ? '#1f2937' : '#ffffff',
    border: isDark ? '#374151' : '#e5e5e5',
    text: isDark ? '#f9fafb' : '#111827',
    subtext: isDark ? '#9ca3af' : '#6b7280',
  };

  const handleAcceptNecessary = () => {
    setDataUsageAccepted(true);
    setPersonalizedAdsAccepted(false);
  };

  const handleAcceptAll = () => {
    setDataUsageAccepted(true);
    setPersonalizedAdsAccepted(true);
  };

  const handleContinue = () => {
    if (!dataUsageAccepted) {
      Alert.alert(
        'Atención',
        'Debes aceptar el uso de datos esenciales para continuar',
        [{ text: 'Entendido' }]
      );
      return;
    }

    router.replace({
      pathname: '/welcome',
      params: { fromPrivacy: 'true', timestamp: Date.now() },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Status Bar */}
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#06B6D4" />
          <ThemedText style={[styles.backText, { color: '#06B6D4' }]}>
            Atrás
          </ThemedText>
        </TouchableOpacity>
      </View>

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

        {/* Title */}
        <ThemedText style={[styles.title, { color: colors.text }]}>
          Hablemos de privacidad
        </ThemedText>

        {/* Privacy Options */}
        <View style={styles.optionsContainer}>
          {/* Data Usage Toggle */}
          <View style={styles.optionRow}>
            <View style={styles.optionTextContainer}>
              <ThemedText style={[styles.optionText, { color: colors.text }]}>
                Acepto el uso de mis{' '}
                <ThemedText style={styles.highlightText}>
                  datos de la aplicación
                </ThemedText>{' '}
                (incluido mi estado de embarazo) para recibir servicios en la
                aplicación.
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
              changeValueImmediately={true}
            />
          </View>

          {/* Personalized Ads Toggle */}
          <View style={styles.optionRow}>
            <View style={styles.optionTextContainer}>
              <ThemedText style={[styles.optionText, { color: colors.text }]}>
                Acepto recibir{' '}
                <ThemedText style={styles.highlightText}>
                  publicidad personalizada
                </ThemedText>{' '}
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
              changeValueImmediately={true}
            />
          </View>
        </View>

        {/* Privacy Policy Link */}
        <ThemedText style={[styles.privacyText, { color: colors.subtext }]}>
          Para más información, consulte nuestra{' '}
          <ThemedText
            style={styles.privacyLink}
            onPress={() => setShowPrivacyModal(true)}
          >
            política de privacidad
          </ThemedText>
          .
        </ThemedText>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.necessaryButton]}
              onPress={handleAcceptNecessary}
            >
              <ThemedText style={styles.necessaryButtonText}>
                Aceptar lo necesario
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.allButton]}
              onPress={handleAcceptAll}
            >
              <ThemedText style={styles.allButtonText}>Aceptar todo</ThemedText>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <ThemedText style={[styles.continueText, { color: colors.subtext }]}>
              Continuar
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Privacy Policy Modal */}
      <Modal
        visible={showPrivacyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <View style={styles.modalBackground}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.modalTitle, { color: colors.text }]}>
              Política de Privacidad
            </ThemedText>
            <ScrollView>
              <ThemedText style={[styles.modalText, { color: colors.subtext }]}>
                Aquí van los términos y condiciones de privacidad. Explica cómo
                se manejan los datos, seguridad, uso de información, etc. Puedes
                poner texto largo y el modal será scrollable.
              </ThemedText>
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowPrivacyModal(false)}
            >
              <ThemedText style={styles.closeButtonText}>Cerrar</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Home Indicator (solo para iOS) */}
      {Platform.OS === 'ios' && (
        <View style={[styles.homeIndicator, { backgroundColor: colors.background }]}>
          <View
            style={[
              styles.homeIndicatorBar,
              { backgroundColor: isDark ? '#9ca3af' : '#000000' },
            ]}
          />
        </View>
      )}
    </View>
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
  heartContainer: {
    position: 'absolute',
    bottom: -4,
    left: '50%',
    transform: [{ translateX: -12 }],
  },
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

  /* Modal styles */
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: { borderRadius: 12, padding: 20, width: '100%', maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  modalText: { fontSize: 14, lineHeight: 20, marginBottom: 20 },
  closeButton: {
    backgroundColor: '#06B6D4',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: { color: '#fff', fontWeight: '600' },
});
