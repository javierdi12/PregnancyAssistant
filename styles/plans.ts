import { StyleSheet } from 'react-native';

export const getPlansStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#121212' : '#FFF5F8',
    },
    header: {
      paddingTop: 20,
      paddingHorizontal: 20,
      paddingBottom: 20,
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: isDarkMode ? '#FFB6D9' : '#D6336C',
      marginBottom: 8,
      textAlign: 'center',
      lineHeight: 36,
    },
    headerSubtitle: {
      fontSize: 15,
      color: isDarkMode ? '#D4A5C0' : '#9E7B8E',
      textAlign: 'center',
      lineHeight: 22,
    },
    planCard: {
      marginHorizontal: 20,
      marginBottom: 20,
      backgroundColor: isDarkMode ? '#2A2335' : '#FFFFFF',
      borderRadius: 24,
      padding: 24,
      borderWidth: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 12,
      elevation: 6,
    },
    planCardPopular: {
      borderWidth: 3,
      shadowOpacity: isDarkMode ? 0.4 : 0.15,
      elevation: 8,
    },
    popularBadge: {
      position: 'absolute',
      top: -12,
      alignSelf: 'center',
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 20,
    },
    popularText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#FFFFFF',
      letterSpacing: 1,
    },
    planHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    planIconBadge: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    planIcon: {
      fontSize: 32,
    },
    planInfo: {
      flex: 1,
    },
    planName: {
      fontSize: 22,
      fontWeight: '700',
      marginBottom: 4,
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    planPrice: {
      fontSize: 28,
      fontWeight: '700',
      color: isDarkMode ? '#FFB6D9' : '#D6336C',
    },
    planPeriod: {
      fontSize: 16,
      color: isDarkMode ? '#D4A5C0' : '#9E7B8E',
    },
    featuresContainer: {
      marginBottom: 20,
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    featureText: {
      fontSize: 14,
      marginLeft: 12,
      flex: 1,
      color: isDarkMode ? '#D4A5C0' : '#6B5B62',
      lineHeight: 20,
    },
    featureBold: {
      fontWeight: '700',
      fontSize: 15,
      color: isDarkMode ? '#FFB6D9' : '#C62368',
    },
    featureHighlight: {
      fontWeight: '600',
      color: isDarkMode ? '#63D5A8' : '#4CAF50',
    },
    ctaButton: {
      paddingVertical: 16,
      borderRadius: 16,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 6,
    },
    ctaButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    currentPlanBadge: {
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 2,
    },
    currentPlanText: {
      fontSize: 16,
      fontWeight: '700',
    },
    footer: {
      marginHorizontal: 20,
      marginTop: 10,
      padding: 20,
      backgroundColor: isDarkMode ? '#2A2335' : '#FFFFFF',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: isDarkMode ? '#3D3147' : '#FFE4ED',
    },
    footerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: isDarkMode ? '#FFB6D9' : '#C62368',
      marginBottom: 12,
    },
    footerText: {
      fontSize: 14,
      lineHeight: 22,
      color: isDarkMode ? '#D4A5C0' : '#6B5B62',
    },
    bottomSpacing: {
      height: 40,
    },
  });
