import React, { useState } from "react";
import { View, Text, Button, TextInput, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Methods } from "@/types";

type RootStackParamList = {
  SignIn: undefined;
  Home: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function WelcomeScreen() {
  const { signIn } = useAuth();
  const [guestName, setGuestName] = useState("");
  const navigation = useNavigation<NavigationProp>();

  const handleEmailSignIn = () => {
    navigation.navigate("SignIn");
  };

  const handleGuestSignIn = async () => {
    if (!guestName.trim()) {
      alert("Please enter a name to continue as guest");
      return;
    }
    try {
      await signIn(Methods.GUEST, guestName);
      navigation.navigate("Home");
    } catch (error) {
      console.error("Guest sign-in failed:", error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signIn(Methods.GOOGLE);
      navigation.navigate("Home");
    } catch (error) {
      console.error("Google sign-in failed:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to PillTickr</Text>
      <Button title="Sign in with Email" onPress={handleEmailSignIn} />
      <Button title="Sign in with Google" onPress={handleGoogleSignIn} />
      <TextInput
        placeholder="Enter name to continue as guest"
        value={guestName}
        onChangeText={setGuestName}
        style={styles.input}
      />
      <Button title="Continue as Guest" onPress={handleGuestSignIn} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, padding: 10, borderRadius: 8, marginVertical: 10 },
});
