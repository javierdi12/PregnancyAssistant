import { router } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

export default function MoreScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const styles = getStyles(isDarkMode);

  const menuItems = [
    {
      title: 'Mi Perfil',
      icon: 'user',
      path: '/(tabs)/profile',
    },
    {
      title: 'Mapa',
      icon: 'map',
      path: '/(tabs)/map',
    },
    {
      title: 'Comunidad',
      icon: 'users',
      path: '/(tabs)/community',
    },
    {
      title: 'Privacy',
      icon: 'shield',
      path: '/privacy',
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>More</ThemedText>
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => router.push(item.path)}>
            <Feather name={item.icon as any} size={24} color={styles.menuItemText.color} />
            <ThemedText style={styles.menuItemText}>{item.title}</ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </ThemedView>
  );
}

const getStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: isDarkMode ? '#121212' : '#FAFAFA',
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 30,
      color: isDarkMode ? '#FFFFFF' : '#1A237E',
    },
    menuContainer: {
      width: '100%',
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
      padding: 20,
      borderRadius: 12,
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    menuItemText: {
      marginLeft: 15,
      fontSize: 18,
      fontWeight: 'bold',
      color: isDarkMode ? '#FFFFFF' : '#333333',
    },
  });