import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getPlansStyles } from '@/styles/plans';
import { Feather } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    TouchableOpacity,
    View,
    useColorScheme
} from 'react-native';

export default function PlansScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const styles = getPlansStyles(isDarkMode);

  const plans = [
    {
      id: 'free',
      name: 'Plan Gratuito',
      price: '$0',
      period: 'Siempre gratis',
      icon: '🌸',
      color: isDarkMode ? '#FFB6D9' : '#FF6B9D',
      features: [
        { text: 'Seguimiento completo (semana 1-40+)', included: true },
        { text: 'Imágenes básicas del desarrollo fetal', included: true },
        { text: '3 registros de signos vitales por mes', included: true },
        { text: '5 registros de síntomas por mes', included: true },
        { text: 'Mensajes a máximo 5 usuarios/mes', included: true },
        { text: 'Asistente IA: 5 consultas por día', included: true },
        { text: 'Mapa de hospitales y clínicas', included: true },
        { text: '1 recordatorio de cita médica', included: true },
      ],
    },
    {
      id: 'pro',
      name: 'Plan Pro',
      price: '$3.99',
      period: 'por mes',
      icon: '👑',
      color: isDarkMode ? '#B794F6' : '#9C27B0',
      popular: true,
      features: [
        { text: 'Todo del Plan Gratuito', included: true, bold: true },
        { text: 'Imágenes realistas y personalizadas', included: true },
        { text: 'Registros ilimitados de signos vitales', included: true },
        { text: 'Registros ilimitados de síntomas', included: true },
        { text: 'Mensajes ilimitados a usuarios', included: true },
        { text: 'Asistente IA ilimitado', included: true },
        { text: 'Análisis de tendencias y gráficas', included: true },
        { text: 'Recordatorios ilimitados de citas', included: true },
        { text: 'Exportar historial médico en PDF', included: true },
        { text: 'Contenido educativo premium', included: true },
        { text: 'Lista de preparativos para el parto', included: true },
        { text: '7 días de prueba gratis', included: true, highlight: true },
      ],
    },
    {
      id: 'family',
      name: 'Plan Familia',
      price: '$5.99',
      period: 'por mes',
      icon: '💕',
      color: isDarkMode ? '#FF8C69' : '#FF6B9D',
      features: [
        { text: 'Todo del Plan Pro', included: true, bold: true },
        { text: 'Acceso compartido para tu pareja', included: true },
        { text: 'Ambos pueden ver y registrar', included: true },
        { text: 'Notificaciones para ambos', included: true },
        { text: 'Calendario compartido de citas', included: true },
        { text: 'Notas privadas entre la pareja', included: true },
        { text: 'Preparación para el parto en equipo', included: true },
        { text: '7 días de prueba gratis', included: true, highlight: true },
      ],
    },
  ];

  const renderFeature = (feature: any) => (
    <View key={feature.text} style={styles.featureRow}>
      <Feather 
        name={feature.included ? 'check-circle' : 'x-circle'} 
        size={18} 
        color={feature.included ? (isDarkMode ? '#63D5A8' : '#4CAF50') : '#999'} 
      />
      <ThemedText 
        style={[
          styles.featureText,
          feature.bold && styles.featureBold,
          feature.highlight && styles.featureHighlight,
        ]}
      >
        {feature.text}
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Planes Premium',
          headerShown: true,
        }} 
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>✨ Elige tu plan ✨</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Desbloquea todo el potencial de Pregnancy Assistant
          </ThemedText>
        </View>

        {/* Plans */}
        {plans.map((plan) => (
          <View 
            key={plan.id} 
            style={[
              styles.planCard,
              { borderColor: plan.color },
              plan.popular && styles.planCardPopular,
            ]}
          >
            {plan.popular && (
              <View style={[styles.popularBadge, { backgroundColor: plan.color }]}>
                <ThemedText style={styles.popularText}>MÁS POPULAR</ThemedText>
              </View>
            )}

            {/* Plan Header */}
            <View style={styles.planHeader}>
              <View style={[styles.planIconBadge, { backgroundColor: `${plan.color}20` }]}>
                <ThemedText style={styles.planIcon}>{plan.icon}</ThemedText>
              </View>
              <View style={styles.planInfo}>
                <ThemedText style={[styles.planName, { color: plan.color }]}>
                  {plan.name}
                </ThemedText>
                <View style={styles.priceContainer}>
                  <ThemedText style={styles.planPrice}>{plan.price}</ThemedText>
                  <ThemedText style={styles.planPeriod}> {plan.period}</ThemedText>
                </View>
              </View>
            </View>

            {/* Features */}
            <View style={styles.featuresContainer}>
              {plan.features.map(renderFeature)}
            </View>

            {/* CTA Button */}
            {plan.id !== 'free' && (
              <TouchableOpacity 
                style={[styles.ctaButton, { backgroundColor: plan.color }]}
                onPress={() => {
                  // TODO: Implement subscription logic
                  console.log(`Selected plan: ${plan.id}`);
                }}
              >
                <ThemedText style={styles.ctaButtonText}>
                  {plan.id === 'free' ? 'Plan Actual' : 'Comenzar Prueba Gratis'}
                </ThemedText>
              </TouchableOpacity>
            )}

            {plan.id === 'free' && (
              <View style={[styles.currentPlanBadge, { borderColor: plan.color }]}>
                <ThemedText style={[styles.currentPlanText, { color: plan.color }]}>
                  ✓ Plan Actual
                </ThemedText>
              </View>
            )}
          </View>
        ))}

        {/* Footer Info */}
        <View style={styles.footer}>
          <ThemedText style={styles.footerTitle}>💝 Información importante</ThemedText>
          <ThemedText style={styles.footerText}>
            • Puedes cancelar en cualquier momento{'\n'}
            • Los planes Pro y Familia incluyen 7 días de prueba gratis{'\n'}
            • Sin compromisos ni cargos ocultos{'\n'}
            • Soporte dedicado para suscriptores premium
          </ThemedText>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </ThemedView>
  );
}
