import React, { useState } from "react";
import { View, Text, Button, TextInput, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function SplashScreen() {
  const { signIn } = useAuth();
  const [guestName, setGuestName] = useState("");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to PillTickr</Text>
      <Button title="Sign in with Email" onPress={() => signIn("User", false)} />
      <Button title="Sign in with Google" onPress={() => signIn("Google User", false)} />
      <TextInput
        placeholder="Enter name to continue as guest"
        value={guestName}
        onChangeText={setGuestName}
        style={styles.input}
      />
      <Button title="Continue as Guest" onPress={() => signIn(guestName || "Guest", true)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  title: { fontSize: 24, marginBottom: 20 },
  input: { borderWidth: 1, padding: 10, borderRadius: 8, marginVertical: 10 },
});
