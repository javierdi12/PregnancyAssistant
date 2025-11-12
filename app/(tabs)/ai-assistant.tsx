import { Collapsible } from '@/components/Collapsible';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getStyles } from '../../styles/ai-assistant.styles';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
import { Colors } from '@/constants/Colors';



// The api key for Gemini
const GEMINI_API_KEY = 'AIzaSyCEqC-8B5IFw3f9y7hEL_wHRKXROLeUb_c';


export default function AIAssistantScreen() {
  const [dailyTip, setDailyTip] = useState<string | null>(null);
  const [loadingTip, setLoadingTip] = useState<boolean>(true);
  const [question, setQuestion] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [askingAI, setAskingAI] = useState<boolean>(false);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const styles = getStyles(isDarkMode);

  // Simulated API call to get a daily tip
  const fetchDailyTip = async () => {
    setLoadingTip(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const tips = [
      "💧 Mantente hidratada bebiendo suficiente agua durante el día.",
      "🚶‍♀️ Realiza caminatas suaves para mantenerte activa y mejorar la circulación.",
      "😴 Asegúrate de descansar lo suficiente; las siestas cortas pueden ser muy útiles.",
      "🥗 Consume una dieta equilibrada rica en frutas, verduras y proteínas.",
      "💝 Habla con tu bebé; se ha demostrado que fortalece el vínculo.",
      "🏡 Prepara tu espacio para el bebé con anticipación para reducir el estrés.",
      "👶 Asiste a clases de preparación para el parto para sentirte más segura.",
      "🤗 No dudes en pedir ayuda a tu pareja, familiares o amigos.",
      "📝 Lleva un registro de los movimientos de tu bebé a medida que avanza el embarazo.",
      "✨ Disfruta de este momento único y especial en tu vida."
    ];
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    setDailyTip(randomTip);
    setLoadingTip(false);
  };


  // Actual AI response using Gemini API
const handleAskAI = async () => {
  if (!question.trim()) {
    setAiResponse("Por favor, escribe una pregunta.");
    return;
  }
  
 

  setAskingAI(true);
  setAiResponse(null);

  try {
    //  URL CORRECTA con modelo actualizado
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: question }] }],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Error al comunicarse con la API de Gemini.');
    }

    const data = await response.json();

    if (
      data.candidates &&
      data.candidates.length > 0 &&
      data.candidates[0].content?.parts?.length > 0
    ) {
      setAiResponse(data.candidates[0].content.parts[0].text.trim());
    } else {
      setAiResponse('No se recibió una respuesta válida de la IA.');
    }
  } catch (error: any) {
    console.error('Error al llamar a la API de Gemini:', error);
    setAiResponse(`Error: ${error.message || 'Algo salió mal al obtener la respuesta de la IA.'}`);
    Alert.alert('Error de IA', error.message || 'Algo salió mal al obtener la respuesta de la IA.');
  } finally {
    setAskingAI(false);
    setQuestion('');
  }
};

  useEffect(() => {
    fetchDailyTip();
  }, []);



  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >

        {/* Header */}
        <View style={styles.header}>
            <ThemedText style={styles.title}>✨ Asistente de IA ✨</ThemedText>
            <ThemedText style={styles.subtitle}>Tu compañera inteligente durante el embarazo</ThemedText>
        </View>
        
        {/* Preguntas frecuentes */}
        <ThemedText style={styles.sectionTitle}>💭 Preguntas Frecuentes</ThemedText>
        <Collapsible title="🤰 ¿Qué es el embarazo?">
          <ThemedText>El embarazo es el período en el que un feto se desarrolla dentro del útero de una mujer.</ThemedText>
        </Collapsible>
        <Collapsible title="⏰ ¿Cuánto dura un embarazo?">
          <ThemedText>Un embarazo a término completo dura aproximadamente 40 semanas, o unos 9 meses.</ThemedText>
        </Collapsible>
        <Collapsible title="💫 ¿Cuáles son los primeros signos de embarazo?">
          <ThemedText>Los primeros signos pueden incluir un período menstrual omitido, náuseas, fatiga y sensibilidad en los senos.</ThemedText>
        </Collapsible>
        <Collapsible title="¿Es seguro hacer ejercicio durante el embarazo?">
          <ThemedText>En la mayoría de los casos, el ejercicio moderado es seguro y beneficioso durante el embarazo, pero siempre consulte a su médico.</ThemedText>
        </Collapsible>
        
        {/* Consejos diarios */}
        <ThemedText style={styles.subtitle}>💕 Consejo del Día</ThemedText>
        {loadingTip ? (
          <ActivityIndicator size="large" color={isDarkMode ? Colors.dark.tint : Colors.light.tint} />
        ) : (
          <ThemedText style={styles.content}>{dailyTip}</ThemedText>
        )}
        
        {/* Preguntar a la IA */}
        <ThemedText style={styles.sectionTitle}>🤖 Pregunta a la IA</ThemedText>
        <ThemedText style={[styles.subtitle, { marginTop: 0, marginBottom: 16 }]}>
          Haz cualquier pregunta sobre tu embarazo
        </ThemedText>
                
        <TextInput
          style={styles.input}
          placeholder="Escribe tu pregunta aquí... 💭"
          placeholderTextColor={isDarkMode ? '#6B5B62' : '#C4A4B4'}
          value={question}
          onChangeText={setQuestion}
          multiline
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleAskAI}
          disabled={askingAI}
        >
          {askingAI ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.askButtonText}>✨ Preguntar</ThemedText>
          )}
        </TouchableOpacity>
        
        {aiResponse && (
          <ThemedView style={styles.aiResponseContainer}>
            <ThemedText style={styles.aiResponseText}>{aiResponse}</ThemedText>
          </ThemedView>
        )}
      </ScrollView>
    </ThemedView>
  );
}