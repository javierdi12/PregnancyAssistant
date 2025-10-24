import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { Feather } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage"
import { useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native"
import { auth, db } from "../../FireBase"

export default function CreatePostScreen() {
  const { forumId } = useLocalSearchParams()
  const [postText, setPostText] = useState("")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const router = useRouter()

  const colorScheme = useColorScheme()
  const isDarkMode = colorScheme === "dark"
  const styles = getStyles(isDarkMode)

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    })

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri)
    }
  }

  const uploadImage = async (uri: string) => {
    const response = await fetch(uri)
    const blob = await response.blob()
    const storage = getStorage()
    const storageRef = ref(storage, `post_images/${auth.currentUser?.uid}/${Date.now()}`)
    await uploadBytes(storageRef, blob)
    return await getDownloadURL(storageRef)
  }

  const handleSubmit = async () => {
    if (!postText.trim()) {
      Alert.alert("💭 Espera", "Por favor, escribe algo en tu publicación antes de compartirla.")
      return
    }
    if (!auth.currentUser) {
      Alert.alert("🔐 Autenticación necesaria", "Debes iniciar sesión para publicar en la comunidad.")
      return
    }
    if (!forumId) {
      Alert.alert("😔 Error", "No pudimos identificar el foro. Por favor, intenta de nuevo.")
      return
    }

    setUploading(true)
    try {
      let imageUrl: string | undefined
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage)
      }

      console.log("Auth User:", auth.currentUser)
      await addDoc(collection(db, "posts"), {
        forumId: forumId,
        userId: auth.currentUser.uid,
        text: postText,
        imageUrl: imageUrl || null,
        createdAt: serverTimestamp(),
        likesCount: 0,
        commentsCount: 0,
      })

      Alert.alert("✨ ¡Perfecto!", "¡Tu publicación ha sido compartida con la comunidad! 💝")
      router.back()
    } catch (error) {
      console.error("Error creating post (full error object):", JSON.stringify(error, null, 2))
      Alert.alert("😔 Error", "No pudimos crear tu publicación. Por favor, intenta de nuevo.")
    } finally {
      setUploading(false)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Nueva Publicación",
          headerStyle: {
            backgroundColor: isDarkMode ? "#2A2335" : "#FFFFFF",
          },
          headerTintColor: isDarkMode ? "#FFB6D9" : "#C62368",
        }}
      />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText style={styles.title}>Comparte con la Comunidad</ThemedText>
            <ThemedText style={styles.subtitle}>Tu experiencia puede ayudar a otras mamás</ThemedText>
          </View>

          {/* Text Input Card */}
          <View style={styles.textCard}>
            <View style={styles.textCardHeader}>
              <ThemedText style={styles.textCardIcon}>💭</ThemedText>
              <ThemedText style={styles.textCardTitle}>¿Qué quieres compartir?</ThemedText>
            </View>
            <TextInput
              style={styles.textInput}
              placeholder="Comparte tus pensamientos, preguntas o experiencias..."
              multiline
              value={postText}
              onChangeText={setPostText}
              editable={!uploading}
              placeholderTextColor={isDarkMode ? "#6B5B62" : "#C4A4B4"}
            />
            <View style={styles.characterCount}>
              <ThemedText style={styles.characterCountText}>{postText.length} caracteres</ThemedText>
            </View>
          </View>

          {/* Image Card */}
          <View style={styles.imageCard}>
            <View style={styles.imageCardHeader}>
              <ThemedText style={styles.imageCardIcon}>📸</ThemedText>
              <ThemedText style={styles.imageCardTitle}>Imagen (Opcional)</ThemedText>
            </View>

            {selectedImage ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: selectedImage }} style={styles.previewImage} />
                <TouchableOpacity style={styles.removeImageButton} onPress={removeImage} disabled={uploading}>
                  <Feather name="x" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.imagePlaceholder}>
                <ThemedText style={styles.placeholderIcon}>🖼️</ThemedText>
                <ThemedText style={styles.placeholderText}>Añade una imagen para ilustrar tu publicación</ThemedText>
              </View>
            )}

            <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage} disabled={uploading}>
              <Feather name="camera" size={20} color="#FFFFFF" />
              <ThemedText style={styles.imagePickerButtonText}>
                {selectedImage ? "Cambiar Imagen" : "Seleccionar Imagen"}
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Tips Card */}
          <View style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <ThemedText style={styles.tipsIcon}>💡</ThemedText>
              <ThemedText style={styles.tipsTitle}>Consejos para tu publicación</ThemedText>
            </View>
            <ThemedText style={styles.tipText}>• Sé respetuosa y empática con otras mamás</ThemedText>
            <ThemedText style={styles.tipText}>• Comparte experiencias personales auténticas</ThemedText>
            <ThemedText style={styles.tipText}>• Evita información médica no verificada</ThemedText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer with Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, uploading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <ThemedText style={styles.submitButtonText}>Publicando...</ThemedText>
            </>
          ) : (
            <>
              <Feather name="send" size={20} color="#FFFFFF" />
              <ThemedText style={styles.submitButtonText}>✨ Publicar</ThemedText>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ThemedView>
  )
}

const getStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? "#1A1625" : "#FFF5F8",
    },
    scrollContainer: {
      padding: 20,
      paddingBottom: 100,
    },
    header: {
      alignItems: "center",
      marginBottom: 24,
    },
    headerIconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: isDarkMode ? "#3D3147" : "#FFE4ED",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    headerIcon: {
      fontSize: 32,
    },
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: isDarkMode ? "#FFB6D9" : "#C62368",
      textAlign: "center",
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      textAlign: "center",
      color: isDarkMode ? "#D4A5C0" : "#9E7B8E",
      fontStyle: "italic",
    },
    textCard: {
      backgroundColor: isDarkMode ? "#2A2335" : "#FFFFFF",
      borderRadius: 24,
      padding: 20,
      marginBottom: 16,
      shadowColor: isDarkMode ? "#000" : "#D6336C",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDarkMode ? 0.3 : 0.12,
      shadowRadius: 12,
      elevation: 6,
      borderWidth: 1,
      borderColor: isDarkMode ? "#3D3147" : "#FFE4ED",
    },
    textCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    textCardIcon: {
      fontSize: 24,
      marginRight: 12,
    },
    textCardTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: isDarkMode ? "#FFB6D9" : "#C62368",
    },
    textInput: {
      minHeight: 160,
      fontSize: 16,
      lineHeight: 24,
      color: isDarkMode ? "#D4A5C0" : "#6B5B62",
      textAlignVertical: "top",
    },
    characterCount: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? "#3D3147" : "#FFE4ED",
    },
    characterCountText: {
      fontSize: 13,
      color: isDarkMode ? "#9E7B8E" : "#C4A4B4",
      textAlign: "right",
    },
    imageCard: {
      backgroundColor: isDarkMode ? "#2A2335" : "#FFFFFF",
      borderRadius: 24,
      padding: 20,
      marginBottom: 16,
      shadowColor: isDarkMode ? "#000" : "#D6336C",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDarkMode ? 0.3 : 0.12,
      shadowRadius: 12,
      elevation: 6,
      borderWidth: 1,
      borderColor: isDarkMode ? "#3D3147" : "#FFE4ED",
    },
    imageCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    imageCardIcon: {
      fontSize: 24,
      marginRight: 12,
    },
    imageCardTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: isDarkMode ? "#FFB6D9" : "#C62368",
    },
    imagePlaceholder: {
      width: "100%",
      height: 180,
      borderRadius: 16,
      backgroundColor: isDarkMode ? "#3D3147" : "#FFF5F8",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
      borderWidth: 2,
      borderStyle: "dashed",
      borderColor: isDarkMode ? "#6B5B62" : "#FFE4ED",
    },
    placeholderIcon: {
      fontSize: 48,
      marginBottom: 12,
    },
    placeholderText: {
      fontSize: 14,
      color: isDarkMode ? "#9E7B8E" : "#C4A4B4",
      textAlign: "center",
      paddingHorizontal: 20,
    },
    imagePreviewContainer: {
      position: "relative",
      marginBottom: 16,
    },
    previewImage: {
      width: "100%",
      height: 220,
      borderRadius: 16,
      backgroundColor: isDarkMode ? "#3D3147" : "#FFF5F8",
    },
    removeImageButton: {
      position: "absolute",
      top: 12,
      right: 12,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      justifyContent: "center",
      alignItems: "center",
    },
    imagePickerButton: {
      backgroundColor: isDarkMode ? "#B794F6" : "#FF6B9D",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    imagePickerButtonText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "700",
      marginLeft: 10,
    },
    tipsCard: {
      backgroundColor: isDarkMode ? "#2A2335" : "#FFFFFF",
      borderRadius: 24,
      padding: 20,
      shadowColor: isDarkMode ? "#000" : "#D6336C",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDarkMode ? 0.3 : 0.12,
      shadowRadius: 12,
      elevation: 6,
      borderWidth: 1,
      borderColor: isDarkMode ? "#3D3147" : "#FFE4ED",
    },
    tipsHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    tipsIcon: {
      fontSize: 24,
      marginRight: 12,
    },
    tipsTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: isDarkMode ? "#FFB6D9" : "#C62368",
    },
    tipText: {
      fontSize: 14,
      lineHeight: 22,
      color: isDarkMode ? "#D4A5C0" : "#6B5B62",
      marginBottom: 8,
    },
    footer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: isDarkMode ? "#2A2335" : "#FFFFFF",
      padding: 20,
      paddingBottom: 32,
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? "#3D3147" : "#FFE4ED",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 10,
    },
    submitButton: {
      backgroundColor: isDarkMode ? "#B794F6" : "#FF6B9D",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 16,
      borderRadius: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 6,
    },
    submitButtonDisabled: {
      backgroundColor: isDarkMode ? "#6B5B62" : "#C4A4B4",
    },
    submitButtonText: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "700",
      marginLeft: 12,
      letterSpacing: 0.5,
    },
  })
