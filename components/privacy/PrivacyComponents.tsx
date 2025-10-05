import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getPrivacyStyles } from '@/styles/privacy';
import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  TouchableOpacity,
  View
} from 'react-native';
import { Switch } from 'react-native-switch';

// Textos estáticos (solo los de la UI)
const PRIVACY_TEXTS = {
  title: 'Hablemos de privacidad',
  dataUsage: 'Acepto el uso de mis datos de la aplicación (incluido mi estado de embarazo) para recibir servicios en la aplicación.',
  personalizedAds: 'Acepto recibir publicidad personalizada en la aplicación (opcional).',
  privacyLink: 'Consulte nuestra política de privacidad.',
  acceptNecessary: 'Aceptar lo necesario',
  acceptAll: 'Aceptar todo',
  continue: 'Continuar',
  back: 'Atrás',
  modalTitle: 'Política de Privacidad',
  close: 'Cerrar'
};

interface PrivacyHeaderProps {
  isDark: boolean;
  onBack: () => void;
}

export const PrivacyHeader = ({ isDark, onBack }: PrivacyHeaderProps) => {
  const styles = getPrivacyStyles(isDark);
  
  return (
    <ThemedView style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="arrow-back" size={20} color="#06B6D4" />
        <ThemedText style={[styles.backText, { color: '#06B6D4' }]}>
          {PRIVACY_TEXTS.back}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
};

interface PrivacyContentProps {
  isDark: boolean;
  dataUsageAccepted: boolean;
  setDataUsageAccepted: (value: boolean) => void;
  personalizedAdsAccepted: boolean;
  setPersonalizedAdsAccepted: (value: boolean) => void;
  onShowPrivacyModal: () => void;
  onAcceptNecessary: () => void;
  onAcceptAll: () => void;
  onContinue: () => void;
}

export const PrivacyContent = ({
  isDark,
  dataUsageAccepted,
  setDataUsageAccepted,
  personalizedAdsAccepted,
  setPersonalizedAdsAccepted,
  onShowPrivacyModal,
  onAcceptNecessary,
  onAcceptAll,
  onContinue,
}: PrivacyContentProps) => {
  const styles = getPrivacyStyles(isDark);

  return (
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

      <ThemedText style={styles.title}>{PRIVACY_TEXTS.title}</ThemedText>

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
        {PRIVACY_TEXTS.privacyLink.slice(0, 28)}
        <ThemedText
          style={styles.privacyLink}
          onPress={onShowPrivacyModal}
        >
          {PRIVACY_TEXTS.privacyLink.slice(28, 51)}
        </ThemedText>
        {PRIVACY_TEXTS.privacyLink.slice(51)}
      </ThemedText>

      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.necessaryButton]}
            onPress={onAcceptNecessary}
          >
            <ThemedText style={styles.necessaryButtonText}>
              {PRIVACY_TEXTS.acceptNecessary}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.allButton]}
            onPress={onAcceptAll}
          >
            <ThemedText style={styles.allButtonText}>
              {PRIVACY_TEXTS.acceptAll}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
          <ThemedText style={styles.continueText}>
            {PRIVACY_TEXTS.continue}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

interface PrivacyModalProps {
  isDark: boolean;
  showPrivacyModal: boolean;
  onCloseModal: () => void;
  privacyContent: string;
  loading?: boolean;
}

export const PrivacyModal = ({ 
  isDark, 
  showPrivacyModal, 
  onCloseModal, 
  privacyContent,
  loading = false
}: PrivacyModalProps) => {
  const styles = getPrivacyStyles(isDark);

  if (!showPrivacyModal) return null;

  return (
    <Modal
      visible={showPrivacyModal}
      animationType="slide"
      transparent
      onRequestClose={onCloseModal}
    >
      <View style={styles.modalBackground}>
        <ThemedView style={styles.modalContent}>
          <ThemedText style={styles.modalTitle}>
            {PRIVACY_TEXTS.modalTitle}
          </ThemedText>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#06B6D4" />
              <ThemedText style={styles.loadingText}>
                Cargando política de privacidad...
              </ThemedText>
            </View>
          ) : (
            <ScrollView>
              <ThemedText style={styles.modalText}>
                {privacyContent}
              </ThemedText>
            </ScrollView>
          )}
          
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onCloseModal}
          >
            <ThemedText style={styles.closeButtonText}>
              {PRIVACY_TEXTS.close}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </View>
    </Modal>
  );
};

interface HomeIndicatorProps {
  isDark: boolean;
}

export const HomeIndicator = ({ isDark }: HomeIndicatorProps) => {
  const styles = getPrivacyStyles(isDark);

  if (Platform.OS !== 'ios') return null;

  return (
    <ThemedView style={styles.homeIndicator}>
      <View
        style={[
          styles.homeIndicatorBar,
          { backgroundColor: isDark ? '#9ca3af' : '#000000' },
        ]}
      />
    </ThemedView>
  );
};