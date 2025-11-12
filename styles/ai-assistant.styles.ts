import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export const getStyles = (isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: isDarkMode ? '#121212' : '#FFF5F8',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: isDarkMode ? '#FFB6D9' : '#D6336C',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    color: isDarkMode ? '#D4A5C0' : '#9E7B8E',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 16,
    color: isDarkMode ? '#FFB6D9' : '#C62368',
    paddingHorizontal: 4,
  },
  content: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: isDarkMode ? Colors.dark.text : Colors.light.text,
  },
  input: {
    width: '100%',
    height: 80,
    borderColor: isDarkMode ? '#555' : '#E8EAF6',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    textAlignVertical: 'top',
    color: isDarkMode ? '#FFFFFF' : '#333333',
    backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
  },
  button: {
    backgroundColor: isDarkMode ? '#BB86FC' : '#5C6BC0',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  askButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  aiResponseContainer: {
    backgroundColor: isDarkMode ? '#1E1E1E' : '#E8EAF6',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    borderColor: isDarkMode ? '#555' : '#E8EAF6',
    borderWidth: 1,
  },
  aiResponseText: {
    fontSize: 16,
    color: isDarkMode ? Colors.dark.text : Colors.light.text,
  },
});