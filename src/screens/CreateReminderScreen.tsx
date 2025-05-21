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
import { saveReminder } from "../storage/reminderStorage";
// import uuid from "react-native-uuid";

export default function CreateReminderScreen({ navigation }: any) {
    const [name, setName] = useState("");
    const [dosage, setDosage] = useState("");
    const [time, setTime] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);

    const handleSave = async () => {
        const newReminder = {
            id: Math.random().toString(36).substring(7),
            name,
            dosage,
            times: [time.toISOString()], // save as ISO string
            startDate: new Date().toISOString().split("T")[0],
            endDate: new Date().toISOString().split("T")[0],
            notes: "",
            isRecurring: false,
            isActive: true,
        };

        await saveReminder(newReminder);
        await schedulePushNotification(name, time);
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
