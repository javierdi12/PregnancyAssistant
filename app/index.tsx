import { router } from 'expo-router';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { auth } from '../FireBase'; // Ajusta la ruta según tu estructura

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Si el usuario YA está logueado, lo mandas directo a tabs
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) router.replace('/(tabs)');
        });
        return unsubscribe;
    }, []);

    const signIn = async () => {
        try {
            const user = await signInWithEmailAndPassword(auth, email, password);
            if (user) router.replace('../tabs');
        } catch (error) {
            const errorMsg = error && typeof error === 'object' && 'message' in error ? error.message : String(error);
            Alert.alert('Error', 'Error al iniciar sesión: ' + errorMsg);
        }
    };

    const signUp = async () => {
        try {
            const user = await createUserWithEmailAndPassword(auth, email, password);
            if (user) router.replace('../(tabs)');
        } catch (error) {
            const errorMsg = error && typeof error === 'object' && 'message' in error ? error.message : String(error);
            Alert.alert('Error', 'Error al crear cuenta: ' + errorMsg);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <TextInput style={styles.textInput} placeholder="Email" value={email} onChangeText={setEmail} />
            <TextInput style={styles.textInput} placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />
            <TouchableOpacity style={styles.button} onPress={signIn}>
                <Text style={styles.text}>Ingresar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={signUp}>
                <Text style={styles.text}>Crear Cuenta</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' },
    title: { fontSize: 28, fontWeight: '800', marginBottom: 40, color: '#1A237E' },
    textInput: { height: 50, width: '90%', backgroundColor: '#FFF', borderColor: '#E8EAF6', borderWidth: 2, borderRadius: 15, marginVertical: 15, paddingHorizontal: 25, fontSize: 16 },
    button: { width: '90%', marginVertical: 15, backgroundColor: '#5C6BC0', padding: 20, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
    text: { color: '#FFF', fontSize: 18, fontWeight: '600' }
});
