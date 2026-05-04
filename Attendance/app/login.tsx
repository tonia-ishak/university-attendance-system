import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from "react";
import {
    Alert,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from "../firebaseConfig";

export default function LoginScreen() {

    const [secure, setSecure] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // 🔹 Validate email
    const isValidEmail = (email: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    // 🔹 Extract name from email
    const getNameFromEmail = (email: string) => {
        const namePart = email.split('@')[0];
        return namePart
            .split(/['_\ .']/)
            .map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
            )
            .join(' ');
    };

    const formatName = (name: string) => {
        return name.charAt(0).toUpperCase() + name.slice(1);
    };

    // ✅ LOGIN WITH FIREBASE
    const handleLogin = async () => {
        if (!email) {
            Alert.alert("Error", "Please enter email");
            return;
        }

        if (!isValidEmail(email)) {
            Alert.alert("Error", "Invalid email format");
            return;
        }

        if (!password) {
            Alert.alert("Error", "Please enter password");
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);

            let name = formatName(getNameFromEmail(email));

            router.replace({
                pathname: './courses',
                params: { name },
            });

        } catch (error: any) {
            Alert.alert("Login Failed", error.message);
        }
    };

    // ✅ FORGOT PASSWORD (REAL)
    const handleForgotPassword = async () => {
        if (!email.trim()) {
            Alert.alert("Error", "Please enter your email first");
            return;
        }

        if (!isValidEmail(email)) {
            Alert.alert("Error", "Please enter a valid email");
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            Alert.alert("Success", "Password reset email sent!\nIf you can't see it check your spam folder.");
        } catch (error: any) {
            Alert.alert("Error", error.message);
        }
    };

    return (
        <LinearGradient
            colors={['#FFD27A', '#FFE7A8', '#FFD27A']}
            style={styles.container}
        >
            <StatusBar barStyle="dark-content" backgroundColor="#FFF8E7" />

            <SafeAreaView style={styles.safeArea}>

                <View style={styles.circleTop} />
                <View style={styles.circleBottom} />

                <Text style={styles.welcome}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to continue</Text>

                <View style={styles.card}>

                    {/* Email */}
                    <Text style={styles.label}>Email</Text>
                    <View style={styles.input}>
                        <Ionicons name="mail-outline" size={20} color="#F97316" />
                        <TextInput
                            placeholder="name@university.com"
                            style={styles.inputText}
                            placeholderTextColor="#999"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Password */}
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.input}>
                        <Ionicons name="lock-closed-outline" size={20} color="#F97316" />
                        <TextInput
                            placeholder="Enter your password"
                            secureTextEntry={secure}
                            style={styles.inputText}
                            placeholderTextColor="#999"
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity onPress={() => setSecure(!secure)}>
                            <Ionicons
                                name={secure ? 'eye-off-outline' : 'eye-outline'}
                                size={20}
                                color="#777"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Forgot Password */}
                    <View style={styles.row}>
                        <TouchableOpacity onPress={handleForgotPassword}>
                            <Text style={styles.forgot}>Forgot password?</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Login Button */}
                    <TouchableOpacity activeOpacity={0.8} onPress={handleLogin}>
                        <LinearGradient
                            colors={['#F97316', '#FBBF24']}
                            style={styles.button}
                        >
                            <Text style={styles.buttonText}>Login →</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },

    safeArea: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    welcome: {
        fontSize: 26,
        fontWeight: '700',
        color: '#F97316',
        marginBottom: 6,
    },

    subtitle: {
        fontSize: 14,
        color: '#555',
        marginBottom: 20,
        textAlign: 'center',
    },

    card: {
        width: '90%',
        backgroundColor: '#FFFFFF',
        borderRadius: 25,
        padding: 20,
        elevation: 6,
    },

    label: {
        fontSize: 14,
        color: '#2C348C',
        marginBottom: 6,
        marginTop: 10,
    },

    input: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 12,
    },

    inputText: {
        flex: 1,
        marginLeft: 8,
    },

    row: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },

    forgot: {
        color: '#F97316',
        fontSize: 12,
    },

    button: {
        marginTop: 20,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },

    buttonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 18,
    },

    circleTop: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(251,191,36,0.3)',
        top: -50,
        right: -50,
    },

    circleBottom: {
        position: 'absolute',
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: 'rgba(249,115,22,0.2)',
        bottom: -60,
        left: -60,
    },
});