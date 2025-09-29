import { StyleSheet } from 'react-native';

export const getLoginStyles = (isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: isDarkMode ? '#121212' : '#FAFAFA',
    paddingHorizontal: 20
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  logo: {
    width: 500,
    height: 250,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    color: isDarkMode ? '#FFFFFF' : '#1A237E',
    textAlign: 'center'
  },
  optionsContainer: {
    width: '100%',
    marginBottom: 20
  },
  optionButton: {
    width: '100%',
    padding: 16,
    borderWidth: 1,
    borderColor: isDarkMode ? '#555' : '#E8EAF6',
    borderRadius: 10,
    marginVertical: 8,
    backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF'
  },
  optionText: {
    textAlign: 'center',
    fontSize: 16,
    color: isDarkMode ? '#FFFFFF' : '#333333'
  },
  disabledOptionText: {
    color: isDarkMode ? '#666' : '#999',
    fontStyle: 'italic'
  },
  divider: {
    marginVertical: 15,
    color: isDarkMode ? '#AAAAAA' : '#666666',
    fontSize: 16,
    fontWeight: 'bold'
  },
  continueWithoutAccount: {
    color: isDarkMode ? '#BB86FC' : '#5C6BC0',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 30
  },
  emailAuthContainer: {
    width: '100%',
    marginBottom: 20
  },
  emailAuthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: isDarkMode ? '#FFFFFF' : '#1A237E',
    marginBottom: 20,
    textAlign: 'center'
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: isDarkMode ? '#555' : '#E8EAF6',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: isDarkMode ? '#FFFFFF' : '#333333',
    backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF'
  },
  authButtonsContainer: {
    width: '100%',
    alignItems: 'center'
  },
  authButton: {
    width: '100%',
    height: 50,
    backgroundColor: isDarkMode ? '#BB86FC' : '#5C6BC0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  cancelText: {
    color: isDarkMode ? '#BB86FC' : '#5C6BC0',
    marginTop: 10
  },
  loadingText: {
    marginTop: 10,
    color: isDarkMode ? '#FFFFFF' : '#333333'
  }
});