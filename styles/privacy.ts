import { StyleSheet } from 'react-native';

export const getPrivacyStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      padding: 16,
      borderBottomWidth: 1,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 20,
    },
    backText: {
      fontWeight: '500',
      marginLeft: 8,
      fontSize: 16,
    },
    scrollContent: {
      flexGrow: 1,
      padding: 24,
      paddingBottom: 50,
      justifyContent: 'center',
    },
    iconContainer: {
      alignItems: 'center',
      marginBottom: 90,
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
    },
    highlightText: {
      color: '#06B6D4',
      fontWeight: '500',
    },
    privacyText: {
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 110,
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
      padding: 11,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 50,
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
      fontSize: 14,
    },
    allButtonText: {
      color: '#ffffff',
      fontWeight: '600',
      fontSize: 14,
    },
    continueButton: {
      padding: 20,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    },
    continueText: {
      fontWeight: '500',
      fontSize: 14,
    },
    homeIndicator: {
      padding: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    homeIndicatorBar: {
      width: 128,
      height: 4,
      borderRadius: 2,
    },
    modalBackground: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      borderRadius: 12,
      padding: 20,
      width: '100%',
      maxHeight: '80%',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 12,
      textAlign: 'center',
    },
    modalText: {
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 20,
    },
    closeButton: {
      backgroundColor: '#06B6D4',
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    closeButtonText: {
      color: '#fff',
      fontWeight: '600',
    },
  });
