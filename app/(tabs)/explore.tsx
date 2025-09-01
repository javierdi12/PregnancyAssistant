import { ThemedText } from '@/components/ThemedText';
import { useState } from 'react';
import {
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { Switch } from 'react-native-switch';
// Reemplazar lucide-react con iconos compatibles
import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function PrivacyScreen() {
  const [dataUsageAccepted, setDataUsageAccepted] = useState(false);
  const [personalizedAdsAccepted, setPersonalizedAdsAccepted] = useState(false);

  const handleAcceptNecessary = () => {
    setDataUsageAccepted(true);
    setPersonalizedAdsAccepted(false);
  };

  const handleAcceptAll = () => {
    setDataUsageAccepted(true);
    setPersonalizedAdsAccepted(true);
  };

  const handleContinue = () => {
    console.log("Privacy settings:", {
      dataUsage: dataUsageAccepted,
      personalizedAds: personalizedAdsAccepted,
    });
  };

  const handlePrivacyPolicyPress = () => {
    Linking.openURL('https://tu-dominio.com/politica-privacidad');
  };

  return (
    <View style={styles.container}>
      {/* Status Bar */}
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          {/* Reemplazar ArrowLeft */}
          <Ionicons name="arrow-back" size={20} color="#06B6D4" />
          <ThemedText style={styles.backText}>Atrás</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Privacy Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            {/* Reemplazar Lock */}
            <MaterialIcons name="lock" size={48} color="#ffffff" />
            <View style={styles.heartContainer}>
              {/* Reemplazar Heart */}
              <FontAwesome name="heart" size={24} color="#EC4899" />
            </View>
          </View>
        </View>

        {/* Title */}
        <ThemedText style={styles.title}>Hablemos de privacidad</ThemedText>

        {/* Privacy Options */}
        <View style={styles.optionsContainer}>
          {/* Data Usage Toggle */}
          <View style={styles.optionRow}>
            <Switch
              value={dataUsageAccepted}
              onValueChange={setDataUsageAccepted}
              activeText=""
              inActiveText=""
              circleSize={24}
              barHeight={28}
              circleBorderWidth={0}
              backgroundActive="#06B6D4"
              backgroundInactive="#e5e5e5"
              circleActiveColor="#ffffff"
              circleInActiveColor="#ffffff"
              changeValueImmediately={true}
            />
            <View style={styles.optionTextContainer}>
              <ThemedText style={styles.optionText}>
                Acepto el uso de mis <ThemedText style={styles.highlightText}>datos de la aplicación</ThemedText> (incluido
                mi estado de embarazo) para recibir servicios en la aplicación.
              </ThemedText>
            </View>
          </View>

          {/* Personalized Ads Toggle */}
          <View style={styles.optionRow}>
            <Switch
              value={personalizedAdsAccepted}
              onValueChange={setPersonalizedAdsAccepted}
              activeText=""
              inActiveText=""
              circleSize={24}
              barHeight={28}
              circleBorderWidth={0}
              backgroundActive="#06B6D4"
              backgroundInactive="#e5e5e5"
              circleActiveColor="#ffffff"
              circleInActiveColor="#ffffff"
              changeValueImmediately={true}
            />
            <View style={styles.optionTextContainer}>
              <ThemedText style={styles.optionText}>
                Acepto recibir <ThemedText style={styles.highlightText}>publicidad personalizada</ThemedText> en la
                aplicación (opcional).
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Privacy Policy Link */}
        <ThemedText style={styles.privacyText}>
          Para más información, consulte nuestra{' '}
          <ThemedText style={styles.privacyLink} onPress={handlePrivacyPolicyPress}>
            política de privacidad
          </ThemedText>.
        </ThemedText>

        {/* Action Buttons */}
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

          <TouchableOpacity 
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <ThemedText style={styles.continueText}>Continuar</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Home Indicator (solo para iOS) */}
      {Platform.OS === 'ios' && (
        <View style={styles.homeIndicator}>
          <View style={styles.homeIndicatorBar} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: '#06B6D4',
    fontWeight: '500',
    marginLeft: 8,
    fontSize: 16,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#111827',
    marginBottom: 32,
    lineHeight: 32,
  },
  optionsContainer: {
    gap: 24,
    marginBottom: 32,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
  highlightText: {
    color: '#06B6D4',
    fontWeight: '500',
  },
  privacyText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 48,
    lineHeight: 20,
  },
  privacyLink: {
    color: '#06B6D4',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  buttonsContainer: {
    gap: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  necessaryButton: {
    backgroundColor: '#cffafe',
    borderWidth: 1,
    borderColor: '#a5f3fc',
  },
  allButton: {
    backgroundColor: '#06B6D4',
  },
  necessaryButtonText: {
    color: '#0891b2',
    fontWeight: '600',
    fontSize: 16,
  },
  allButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  continueButton: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  continueText: {
    color: '#6b7280',
    fontWeight: '500',
    fontSize: 16,
  },
  homeIndicator: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  homeIndicatorBar: {
    width: 128,
    height: 4,
    backgroundColor: '#000000',
    borderRadius: 2,
  },
});