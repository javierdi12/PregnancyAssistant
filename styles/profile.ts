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
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme === 'dark' ? '#fff' : '#1f2937',
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
    ageText: {
      fontSize: 16,
      color: theme === 'dark' ? '#ddd' : '#6b7280',
      textAlign: 'right',
      flex: 1,
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
