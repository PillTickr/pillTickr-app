// screens/SignInScreen.tsx
import React, { useState } from "react";
import { View, Text, Button, TextInput, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Methods } from "@/types";

type RootStackParamList = {
    SplashScreen: undefined;
    SignInScreen: undefined;
    SignUpScreen: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SignInScreen() {
    const { signIn } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigation = useNavigation<NavigationProp>();

    const handleSignIn = async () => {
        try {
            await signIn(Methods.EMAIL, { email, password });
            // Navigate to the main app screen after successful sign-in
            // Example: navigation.navigate("Home");
        } catch (error) {
            console.error("Email sign-in failed:", error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign In</Text>
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                autoCapitalize="none"
            />
            <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                secureTextEntry
            />
            <Button title="Sign In" onPress={handleSignIn} />

            <Text style={{ marginTop: 20 }}>
                Don't have an account?{" "}
                <Text
                    style={{ color: "blue" }}
                    onPress={() => navigation.navigate("SignUpScreen")}
                >
                    Sign Up
                </Text>
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", padding: 24 },
    title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
    input: { borderWidth: 1, padding: 10, borderRadius: 8, marginVertical: 10 },
});
