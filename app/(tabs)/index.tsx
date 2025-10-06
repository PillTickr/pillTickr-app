import { StyleSheet } from "react-native";

import { HelloWave } from "@/components/hello-wave";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Link } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <ThemedView style={{ flex: 1 }}>
      <ThemedText
        style={{
          fontSize: 24,
          fontWeight: "bold",
          textAlign: "center",
          marginTop: 20,
        }}
      >
        Welcome to PillTickr! {user?.name ?? ""}
      </ThemedText>
      <ThemedText
        style={{
          fontSize: 16,
          textAlign: "center",
          marginVertical: 10,
          paddingHorizontal: 20,
        }}
      >
        Your personal medication management app.
      </ThemedText>

      <ThemedView
        style={{
          height: 200,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <HelloWave />
        <ThemedText style={{ fontSize: 28, fontWeight: "bold", marginTop: 10 }}>
          Manage Your Medications with Ease
        </ThemedText>
      </ThemedView>
      <ThemedView style={{ padding: 20 }}>
        <ThemedText
          style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}
        >
          Getting Started
        </ThemedText>
        <ThemedView style={styles.stepContainer}>
          <ThemedText style={{ fontSize: 16, marginBottom: 5 }}>
            1. Add Your Medications
          </ThemedText>
          <ThemedText style={{ fontSize: 14, color: "#666" }}>
            Easily input your medications, dosages, and schedules.
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <ThemedText style={{ fontSize: 16, marginBottom: 5 }}>
            2. Set Reminders
          </ThemedText>
          <ThemedText style={{ fontSize: 14, color: "#666" }}>
            Get timely notifications to take your meds on time.
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <ThemedText style={{ fontSize: 16, marginBottom: 5 }}>
            3. Track Your Progress
          </ThemedText>
          <ThemedText style={{ fontSize: 14, color: "#666" }}>
            Monitor your medication adherence and health improvements.
          </ThemedText>
        </ThemedView>
        <Link
          href="/(tabs)/explore"
          style={{
            marginTop: 20,
            padding: 15,
            backgroundColor: "#007AFF",
            borderRadius: 8,
          }}
        >
          <ThemedText
            style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}
          >
            Add Your First Medication
          </ThemedText>
        </Link>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
