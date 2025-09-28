import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StyleSheet } from 'react-native';

export default function MapView() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Función no disponible</ThemedText>
      <ThemedText>El mapa de recursos solo está disponible en la aplicación móvil.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
