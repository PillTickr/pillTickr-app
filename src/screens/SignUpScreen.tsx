import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker"; // native only
import { useAuth } from "../context/AuthContext";

export default function SignUpScreen() {
  const { signup, isLoading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dob, setDob] = useState<Date | null>(null);
  const [dobText, setDobText] = useState(""); // for web

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.includes("@")) newErrors.email = "Invalid email address";
    if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!dob && !dobText) newErrors.dob = "Date of birth is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const formattedDob =
      Platform.OS === "web"
        ? dobText
        : dob!.toISOString().split("T")[0]; // YYYY-MM-DD

    try {
      await signup({
        email,
        password,
        display_name: name,
        dob: formattedDob,
      });

      Alert.alert("Success", "Sign up successful!");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Signup failed");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      {errors.name && <Text style={styles.error}>{errors.name}</Text>}

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      {errors.email && <Text style={styles.error}>{errors.email}</Text>}

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      {errors.password && <Text style={styles.error}>{errors.password}</Text>}

      <TextInput
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={styles.input}
      />
      {errors.confirmPassword && (
        <Text style={styles.error}>{errors.confirmPassword}</Text>
      )}

      <Text style={styles.label}>Date of Birth</Text>

      {Platform.OS === "web" ? (
        <TextInput
          style={styles.input}
          value={dobText}
          onChangeText={setDobText}
          placeholder="YYYY-MM-DD"
          inputMode="numeric"
          keyboardType="numbers-and-punctuation"
        />
      ) : (
        <>
          <Text
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
          >
            {dob ? dob.toDateString() : "Select Date"}
          </Text>
          {showDatePicker && (
            <DateTimePicker
              mode="date"
              value={dob || new Date(2000, 0, 1)}
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setDob(selectedDate);
                }
              }}
              maximumDate={new Date()}
            />
          )}
        </>
      )}
      {errors.dob && <Text style={styles.error}>{errors.dob}</Text>}

      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button title="Sign Up" onPress={handleSubmit} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  label: { marginLeft: 4, marginBottom: 4, fontWeight: "bold" },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  error: {
    color: "red",
    marginBottom: 10,
    marginLeft: 4,
  },
});
