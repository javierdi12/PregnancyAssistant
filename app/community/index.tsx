import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Link } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, TouchableOpacity, useColorScheme, View, } from 'react-native';
import { db } from '../../FireBase'; // Adjust path as needed

interface Forum {
  id: string;
  name: string;
  description: string;
}

export default function CommunityScreen() {
  const [forums, setForums] = useState<Forum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const colorScheme = useColorScheme()
  const isDarkMode = colorScheme === "dark"
  const styles = getStyles(isDarkMode)

  const fetchForums = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "forums"))
      const fetchedForums: Forum[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        description: doc.data().description,
      }))
      setForums(fetchedForums)
      setError(null)
    } catch (err) {
      console.error("Error fetching forums:", err)
      setError("No pudimos cargar los foros. Por favor, intenta de nuevo.")
    }
  }

  useEffect(() => {
    setLoading(true)
    fetchForums().finally(() => setLoading(false))
  }, [])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchForums()
    setRefreshing(false)
  }, [])

  const getForumIcon = (index: number) => {
    const icons = ["💬", "🏥", "💝", "🌸", "✨", "🤱", "👶", "💕"]
    return icons[index % icons.length]
  }

  const renderItem = ({ item, index }: { item: Forum; index: number }) => (
    <Link href={`/community/${item.id}`} asChild>
      <TouchableOpacity style={styles.forumCard}>
        <View style={styles.forumIconContainer}>
          <ThemedText style={styles.forumIcon}>{getForumIcon(index)}</ThemedText>
        </View>
        <View style={styles.forumContent}>
          <ThemedText style={styles.forumTitle}>{item.name}</ThemedText>
          <ThemedText style={styles.forumDescription}>{item.description}</ThemedText>
        </View>
        <ThemedText style={styles.forumArrow}>→</ThemedText>
      </TouchableOpacity>
    </Link>
  )

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#FF6B9D" />
        <ThemedText style={styles.loadingText}>✨ Cargando la comunidad...</ThemedText>
      </ThemedView>
    )
  }

  if (error) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ThemedText style={styles.errorIcon}>😔</ThemedText>
        <ThemedText style={styles.errorTitle}>¡Ups! Algo salió mal</ThemedText>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchForums()}>
          <ThemedText style={styles.retryButtonText}>🔄 Intentar de nuevo</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    )
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.title}>✨ Comunidad de Mamás ✨</ThemedText>
        <ThemedText style={styles.subtitle}>Conecta, comparte y aprende con otras mamás</ThemedText>
      </View>

      {/* Welcome Card */}
      <View style={styles.welcomeCard}>
        <ThemedText style={styles.welcomeTitle}>¡Bienvenida a nuestra comunidad!</ThemedText>
        <ThemedText style={styles.welcomeText}>
          Este es un espacio seguro para compartir experiencias, hacer preguntas y conectar con otras mamás.
        </ThemedText>
      </View>

      {/* Forums List */}
      {forums.length > 0 ? (
        <FlatList
          data={forums}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#FF6B9D"]} tintColor="#FF6B9D" />
          }
        />
      ) : (
        <View style={styles.emptyStateCard}>
          <ThemedText style={styles.emptyStateIcon}>💬</ThemedText>
          <ThemedText style={styles.emptyStateText}>
            Aún no hay foros disponibles.{"\n"}¡Pronto tendremos contenido para ti!
          </ThemedText>
        </View>
      )}
    </ThemedView>
  )
}

const getStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? "#1A1625" : "#FFF5F8",
    },
    centerContent: {
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    header: {
      alignItems: "center",
      paddingTop: 20,
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: isDarkMode ? "#FFB6D9" : "#D6336C",
      textAlign: "center",
      marginBottom: 8,
      letterSpacing: 0.5,
    },
    subtitle: {
      fontSize: 14,
      textAlign: "center",
      color: isDarkMode ? "#D4A5C0" : "#9E7B8E",
      fontStyle: "italic",
    },
    welcomeCard: {
      backgroundColor: isDarkMode ? "#2A2335" : "#FFFFFF",
      borderRadius: 24,
      padding: 24,
      marginHorizontal: 20,
      marginBottom: 20,
      shadowColor: isDarkMode ? "#000" : "#D6336C",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDarkMode ? 0.3 : 0.12,
      shadowRadius: 12,
      elevation: 6,
      borderWidth: 1,
      borderColor: isDarkMode ? "#3D3147" : "#FFE4ED",
    },
    welcomeIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: isDarkMode ? "#3D3147" : "#FFE4ED",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
      alignSelf: "center",
    },
    welcomeIcon: {
      fontSize: 28,
    },
    welcomeTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: isDarkMode ? "#FFB6D9" : "#C62368",
      marginBottom: 12,
      textAlign: "center",
    },
    welcomeText: {
      fontSize: 14,
      lineHeight: 20,
      color: isDarkMode ? "#D4A5C0" : "#6B5B62",
      textAlign: "center",
    },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    forumCard: {
      backgroundColor: isDarkMode ? "#2A2335" : "#FFFFFF",
      borderRadius: 20,
      padding: 20,
      marginBottom: 16,
      flexDirection: "row",
      alignItems: "center",
      shadowColor: isDarkMode ? "#000" : "#D6336C",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 1,
      borderColor: isDarkMode ? "#3D3147" : "#FFE4ED",
    },
    forumIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: isDarkMode ? "#3D3147" : "#FFE4ED",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    forumIcon: {
      fontSize: 24,
    },
    forumContent: {
      flex: 1,
    },
    forumTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: isDarkMode ? "#FFB6D9" : "#C62368",
      marginBottom: 6,
    },
    forumDescription: {
      fontSize: 14,
      lineHeight: 20,
      color: isDarkMode ? "#D4A5C0" : "#6B5B62",
    },
    forumArrow: {
      fontSize: 24,
      color: isDarkMode ? "#FFB6D9" : "#FF6B9D",
      marginLeft: 8,
    },
    emptyStateCard: {
      backgroundColor: isDarkMode ? "#2A2335" : "#FFFFFF",
      borderRadius: 20,
      padding: 40,
      marginHorizontal: 20,
      alignItems: "center",
      borderWidth: 1,
      borderColor: isDarkMode ? "#3D3147" : "#FFE4ED",
    },
    emptyStateIcon: {
      fontSize: 48,
      marginBottom: 16,
    },
    emptyStateText: {
      fontSize: 15,
      textAlign: "center",
      color: isDarkMode ? "#D4A5C0" : "#9E7B8E",
      lineHeight: 22,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: isDarkMode ? "#FFB6D9" : "#D6336C",
      fontWeight: "600",
    },
    errorIcon: {
      fontSize: 64,
      marginBottom: 16,
    },
    errorTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: isDarkMode ? "#FFB6D9" : "#C62368",
      marginBottom: 12,
      textAlign: "center",
    },
    errorText: {
      fontSize: 15,
      textAlign: "center",
      color: isDarkMode ? "#D4A5C0" : "#9E7B8E",
      lineHeight: 22,
      marginBottom: 24,
    },
    retryButton: {
      backgroundColor: isDarkMode ? "#B794F6" : "#FF6B9D",
      paddingVertical: 14,
      paddingHorizontal: 32,
      borderRadius: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 6,
    },
    retryButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
  })