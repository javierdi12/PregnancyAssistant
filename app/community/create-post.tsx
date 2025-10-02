import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, useColorScheme } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth } from '../../FireBase'; // Adjust path as needed
import { useThemeColor } from '@/hooks/useThemeColor';
import { Feather } from '@expo/vector-icons';

export default function CreatePostScreen() {
  const { forumId } = useLocalSearchParams();
  const [postText, setPostText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const colorScheme = useColorScheme();
  const buttonTextColor = colorScheme === 'dark' ? '#000' : '#fff';

  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storage = getStorage();
    const storageRef = ref(storage, `post_images/${auth.currentUser?.uid}/${Date.now()}`);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  const handleSubmit = async () => {
    if (!postText.trim()) {
      Alert.alert('Contenido requerido', 'Por favor, escribe algo en tu publicación.');
      return;
    }
    if (!auth.currentUser) {
      Alert.alert('Autenticación requerida', 'Debes iniciar sesión para publicar.');
      return;
    }
    if (!forumId) {
      Alert.alert('Error de Foro', 'No se pudo identificar el foro para esta publicación.');
      return;
    }

    setUploading(true);
    try {
      let imageUrl: string | undefined;
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }

      await addDoc(collection(db, 'posts'), {
        forumId: forumId,
        userId: auth.currentUser.uid,
        text: postText,
        imageUrl: imageUrl || null,
        createdAt: serverTimestamp(),
        likesCount: 0,
        commentsCount: 0,
      });

      Alert.alert('¡Éxito!', 'Tu publicación ha sido creada.');
      router.back();
    } catch (error) {
      console.error('Error creating post (full error object):', JSON.stringify(error, null, 2));
      Alert.alert('Error', 'Hubo un problema al crear la publicación. Revisa la consola para más detalles.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ title: 'Crear Publicación' }} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <ThemedText type="title" style={[styles.title, { color: tintColor }]}>Crea una Nueva Publicación</ThemedText>

          <View style={[styles.card, { backgroundColor: cardColor, borderColor: borderColor }]}>
            <TextInput
              style={[styles.textInput, { color: textColor }]}
              placeholder="Comparte tus pensamientos, preguntas o experiencias..."
              multiline
              value={postText}
              onChangeText={setPostText}
              editable={!uploading}
              placeholderTextColor={placeholderColor}
            />
          </View>

          <View style={[styles.card, styles.imageCard, { backgroundColor: cardColor, borderColor: borderColor }]}>
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            ) : (
              <View style={[styles.imagePlaceholder, { borderColor: borderColor }]}>
                <Feather name="image" size={40} color={placeholderColor} />
                <ThemedText style={{ color: placeholderColor, marginTop: 8 }}>Añade una imagen (opcional)</ThemedText>
              </View>
            )}
            <TouchableOpacity 
              style={[styles.imagePickerButton, { backgroundColor: tintColor }]} 
              onPress={pickImage} 
              disabled={uploading}
            >
              <Feather name="camera" size={18} color={buttonTextColor} />
              <ThemedText style={[styles.imagePickerButtonText, { color: buttonTextColor }]}>{selectedImage ? 'Cambiar Imagen' : 'Seleccionar Imagen'}</ThemedText>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
      <View style={[styles.footer, { backgroundColor: backgroundColor, borderTopColor: borderColor }]}>
        <TouchableOpacity 
          style={[styles.submitButton, { backgroundColor: uploading ? 'gray' : tintColor }]} 
          onPress={handleSubmit} 
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color={buttonTextColor} />
          ) : (
            <>
              <Feather name="send" size={18} color={buttonTextColor} />
              <ThemedText style={[styles.submitButtonText, { color: buttonTextColor }]}>Publicar</ThemedText>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 100, // Space for footer
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textInput: {
    minHeight: 150,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  imageCard: {
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  imagePickerButtonText: {
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 24, // Safe area padding
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  submitButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 25,
  },
  submitButtonText: {
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10,
  },
});