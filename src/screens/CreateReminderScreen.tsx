import React, { useState } from "react";
import {
    Button,
    Text,
    TextInput,
    View,
    StyleSheet,
    Platform,
    Pressable,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { schedulePushNotification } from "../utils/notifications";

export default function CreateReminderScreen({ navigation }: any) {
    const [name, setName] = useState("");
    const [dosage, setDosage] = useState("");
    const [time, setTime] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);

    const handleSave = async () => {
        const timeStr = `${time.getHours().toString().padStart(2, "0")}:${time
            .getMinutes()
            .toString()
            .padStart(2, "0")}`;
        console.log("Scheduling notification for", name, "at", timeStr);
        await schedulePushNotification(name, timeStr);
        navigation.goBack();
    };

    const onChange = (event: any, selectedDate?: Date) => {
        setShowPicker(false);
        if (selectedDate) setTime(selectedDate);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Medicine Name</Text>
            <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g., Paracetamol"
            />

            <Text style={styles.label}>Dosage</Text>
            <TextInput
                style={styles.input}
                value={dosage}
                onChangeText={setDosage}
                placeholder="e.g., 500mg"
            />

            <Text style={styles.label}>Time</Text>
            <Pressable onPress={() => setShowPicker(true)} style={styles.input}>
                <Text>
                    {time.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </Text>
            </Pressable>

            {showPicker && (
                <DateTimePicker
                    value={time}
                    mode="time"
                    is24Hour={true}
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={onChange}
                />
            )}

            <View style={{ marginTop: 24 }}>
                <Button title="Save Reminder" onPress={handleSave} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: "#fff",
    },
    label: {
        fontSize: 16,
        marginBottom: 4,
        marginTop: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 12,
        borderRadius: 8,
        justifyContent: "center",
    },
});
