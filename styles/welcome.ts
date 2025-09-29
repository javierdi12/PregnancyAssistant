import { StyleSheet } from 'react-native';

export const getWelcomeStyles = (isDarkMode: boolean) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: isDarkMode ? '#121212' : '#FAFAFA',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 100,
  },
  welcomeImage: {
    width: 550,
    height: 300,
    marginBottom: 50,
  },
  welcomeText: {
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 40,
    color: isDarkMode ? '#FFFFFF' : '#1A237E',
    textAlign: 'center',
    lineHeight: 32,
  },
  button: {
    width: '60%',
    height: 50,
    backgroundColor: '#06B6D4',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 250
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: isDarkMode ? '#000000' : '#FFFFFF',
  },
  overlayText: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 30,
    color: isDarkMode ? '#FFFFFF' : '#000000',
    padding: 20,
  },
});