import React from "react";
import { View, Text, Switch, Button, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function ProfileScreen() {
  const { isGuest, name, isSyncEnabled, toggleSync, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.name}>👤 {name}</Text>
      <Text>Sync Reminders to Cloud</Text>
      <Switch
        value={isSyncEnabled}
        onValueChange={toggleSync}
        disabled={isGuest}
      />
      <Button title="Sign Out" onPress={signOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  name: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
});
