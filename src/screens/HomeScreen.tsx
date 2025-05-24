import React, { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { useReminders } from "@/src/hooks/useReminder";
import { useAuth } from "../context/AuthContext";

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

export default function HomeScreen() {
    const { getReminders } = useReminders();
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const { name, isLoading } = useAuth();

    useEffect(() => {
        if (!name) {
            navigation.navigate("Welcome" as never);
        }
        // if (isFocused && !isLoading) {
            loadReminders();
        // }
    }, [isFocused, isLoading, name]);

    const loadReminders = async () => {
        const data = await getReminders();
        // console.log("Loaded reminders:", data);
        setReminders(data);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Hi {name} </Text>
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
                            🕑{" "}
                            {item.times
                                .map((t) =>
                                    new Date(t).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })
                                )
                                .join(", ")}
                        </Text>
                        {item.notes ? (
                            <Text style={styles.notes}>{item.notes}</Text>
                        ) : null}
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={{ marginTop: 20, color: "#777" }}>
                        No reminders yet.
                    </Text>
                }
            />
            <Pressable
                style={styles.button}
                onPress={() => navigation.navigate("Create Reminder" as never)}
            >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                    + Add Reminder
                </Text>
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
