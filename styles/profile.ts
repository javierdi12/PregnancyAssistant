import { StyleSheet } from 'react-native';

export const getProfileStyles = (theme: 'light' | 'dark') =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: {
      padding: 20,
      paddingBottom: 10,
      alignItems: 'center',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme === 'dark' ? '#fff' : '#1f2937',
      textAlign: 'center',
      marginBottom: 20,
    },
    profilePhotoSection: {
      alignItems: 'center',
      marginBottom: 30,
    },
    profilePhotoContainer: {
      position: 'relative',
      marginBottom: 10,
    },
    profilePhoto: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 3,
      borderColor: theme === 'dark' ? '#3b82f6' : '#1e40af',
    },
    changePhotoButton: {
      position: 'absolute',
      bottom: 5,
      right: 5,
      backgroundColor: theme === 'dark' ? '#3b82f6' : '#1e40af',
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme === 'dark' ? '#121212' : '#fff',
    },
    changePhotoText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
    photoPlaceholderText: {
      fontSize: 14,
      color: theme === 'dark' ? '#ccc' : '#666',
      textAlign: 'center',
    },
    formSection: {
      paddingHorizontal: 20,
    },
    inputRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme === 'dark' ? '#333' : '#e5e7eb',
    },
    label: {
      fontSize: 16,
      fontWeight: '500',
      color: theme === 'dark' ? '#fff' : '#374151',
      width: '40%',
    },
    input: {
      flex: 1,
      textAlign: 'right',
      fontSize: 16,
      color: theme === 'dark' ? '#ddd' : '#6b7280',
      padding: 8,
    },
    dateButton: {
      flex: 1,
      alignItems: 'flex-end',
    },
    dateText: {
      fontSize: 16,
      color: theme === 'dark' ? '#ddd' : '#6b7280',
      textAlign: 'right',
    },
    disabledText: {
      color: theme === 'dark' ? '#666' : '#ccc',
    },
    ageText: {
      fontSize: 16,
      color: theme === 'dark' ? '#ddd' : '#6b7280',
      textAlign: 'right',
      flex: 1,
    },
    // Estilos para modales de ubicación
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      width: '85%',
      maxHeight: '70%',
      borderRadius: 12,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 15,
      textAlign: 'center',
    },
    locationList: {
      maxHeight: 400,
    },
    locationItem: {
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme === 'dark' ? '#333' : '#e5e7eb',
    },
    locationItemText: {
      fontSize: 16,
      color: theme === 'dark' ? '#fff' : '#000',
    },
    selectedLocationText: {
      color: '#3b82f6',
      fontWeight: 'bold',
    },
    modalCloseButton: {
      marginTop: 15,
      padding: 12,
      backgroundColor: theme === 'dark' ? '#3b82f6' : '#1e40af',
      borderRadius: 8,
      alignItems: 'center',
    },
    modalCloseText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    loadingText: {
      marginTop: 10,
      textAlign: 'center',
      color: theme === 'dark' ? '#fff' : '#000',
    },
    divider: {
      height: 1,
      backgroundColor: theme === 'dark' ? '#333' : '#e5e7eb',
      marginVertical: 20,
    },
    helpSection: {
      marginTop: 20,
      paddingHorizontal: 20,
    },
    helpTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 16,
      textAlign: 'center',
      color: theme === 'dark' ? '#fff' : '#1f2937',
    },
    helpButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme === 'dark' ? '#1f1f1f' : '#f3f4f6',
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderRadius: 8,
      marginBottom: 12,
    },
    helpText: {
      fontSize: 16,
      color: theme === 'dark' ? '#fff' : '#1f2937',
    },
    arrow: {
      fontSize: 18,
      color: theme === 'dark' ? '#888' : '#9ca3af',
      fontWeight: 'bold',
    },
    saveButton: {
      backgroundColor: '#3b82f6',
      padding: 16,
      borderRadius: 12,
      margin: 20,
      marginTop: 30,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    saveButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
  });