import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Button } from "react-native";

type Reminder = {
    id: string;
    name: string;
    dosage: string;
    times: string[];
    startDate: string;
    endDate: string;
    notes?: string;
    isRecurring: boolean;
    isActive: boolean;
};

// Sample data
const reminders: Reminder[] = [
    {
        id: "1",
        name: "Paracetamol",
        dosage: "500mg",
        times: ["08:00", "14:00", "20:00"],
        startDate: "2025-05-20",
        endDate: "2025-05-25",
        notes: "Take after meals",
        isRecurring: true,
        isActive: true,
    },
    {
        id: "2",
        name: "Ibuprofen",
        dosage: "400mg",
        times: ["09:00", "21:00"],
        startDate: "2025-05-20",
        endDate: "2025-05-22",
        notes: "With food to avoid stomach upset",
        isRecurring: false,
        isActive: true,
    },
];

export default function HomeScreen() {
    const navigation = useNavigation();
    return (
        <View style={styles.container}>
            <Text style={styles.header}>🕒 Today's Reminders</Text>
            <FlatList
                data={reminders}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 24 }}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.title}>{item.name}</Text>
                        <Text style={styles.subtitle}>{item.dosage}</Text>
                        <Text style={styles.time}>
                            🕑 {item.times.join(", ")}
                        </Text>
                        <Text style={styles.notes}>{item.notes}</Text>
                    </View>
                )}
            />
            {/* <Button
                title="➕ Add Reminder"
                onPress={() => navigation.navigate("CreateReminder")}
                color="#007AFF"
            /> */}
            <Pressable
                style={styles.button}
                onPress={() => navigation.navigate("CreateReminder")}
            >
                <Text>+ Add Reminder</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
        paddingHorizontal: 16,
        backgroundColor: "#f9f9f9",
    },
    header: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 16,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
    },
    subtitle: {
        fontSize: 14,
        color: "#666",
        marginBottom: 4,
    },
    time: {
        fontSize: 14,
        color: "#007AFF",
        marginBottom: 4,
    },
    notes: {
        fontSize: 13,
        color: "#888",
        fontStyle: "italic",
    },
    button: {
        position: "absolute",
        right: 20,
        bottom: 30,
        backgroundColor: "#007AFF",
        borderRadius: 30,
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
});
