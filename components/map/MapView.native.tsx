
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Linking, Platform } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { ThemedText } from '@/components/ThemedText';
import { db } from '../../FireBase'; // Ajusta la ruta si es necesario
import { collection, getDocs, GeoPoint } from 'firebase/firestore';

// Interfaz para los datos del recurso
interface Resource {
  id: string;
  name: string;
  location: GeoPoint;
}

export default function MapViewNative() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const mapViewRef = useRef<MapView>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    const setupMapAndLocation = async () => {
      // 1. Permisos de ubicación
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('El permiso para acceder a la ubicación fue denegado.');
        return;
      }

      // 2. Iniciar la suscripción a la ubicación
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000, // Recibir una actualización cada 5 segundos
          distanceInterval: 10, // O cada 10 metros
        },
        (newLocation) => {
          setLocation(newLocation);
          setErrorMsg(null); // Limpiar error si se recibe una ubicación
        }
      );

      // 3. Obtener recursos de Firestore
      try {
        const querySnapshot = await getDocs(collection(db, "recursos"));
        const resourcesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          location: doc.data().location,
        })) as Resource[];
        setResources(resourcesData);
      } catch (error) {
        console.error("Error fetching resources: ", error);
        setErrorMsg('Error al cargar los recursos desde la base de datos.');
      }
    };

    setupMapAndLocation().catch(error => {
        console.error("Error in setupMapAndLocation: ", error);
        setErrorMsg("Ocurrió un error inesperado al configurar el mapa.");
    });

    // Función de limpieza para detener la suscripción cuando el componente se desmonte
    return () => {
      locationSubscription.current?.remove();
    };
  }, []);

  const openInMaps = (label: string, lat: number, lng: number) => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${lat},${lng}`;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });

    if (url) Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      {location ? (
        <MapView
          ref={mapViewRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          showsUserLocation={true}
        >
          {/* No necesitamos un marcador manual para el usuario si showsUserLocation es true,
              pero lo dejamos por si queremos un estilo personalizado más adelante */}
          <Marker
            coordinate={location.coords}
            title="Tu Ubicación"
            pinColor="blue"
          />

          {/* Marcadores para los recursos */}
          {resources.map(resource => (
            <Marker
              key={resource.id}
              coordinate={{
                latitude: resource.location.latitude,
                longitude: resource.location.longitude,
              }}
              title={resource.name}
            >
              <Callout onPress={() => openInMaps(resource.name, resource.location.latitude, resource.location.longitude)}>
                <View style={styles.calloutView}>
                  <ThemedText type="defaultSemiBold">{resource.name}</ThemedText>
                  <ThemedText style={styles.calloutLink}>Cómo llegar</ThemedText>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      ) : (
        <ThemedText>{errorMsg ? errorMsg : 'Buscando tu ubicación...'}</ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  calloutView: {
    padding: 8,
  },
  calloutLink: {
    color: 'blue',
    marginTop: 4,
  }
});
