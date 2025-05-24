import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";

type RootDrawerParamList = {
    Splash: undefined;
    Welcome: undefined;
    SignIn: undefined;
    Home: undefined;
    CreateReminder: undefined;
    Profile: undefined;
};

type NavigationProp = DrawerNavigationProp<RootDrawerParamList>;

export default function ProfileScreen() {
    const navigation = useNavigation<NavigationProp>();
    const { isGuest, name, logout } = useAuth();

    const handleBackToWelcome = () => {
        navigation.navigate("Welcome");
    };

    const handleSyncToCloud = () => {
        navigation.navigate("SignIn");
    };

    return (
        <View style={styles.container}>
            <Text style={styles.name}>👤 {name}</Text>
            
            <View style={styles.buttonContainer}>
                {isGuest && (
                    <>
                        <Button
                            title="Sync to Cloud"
                            onPress={handleSyncToCloud}
                        />
                        <View style={styles.buttonSpacing} />
                        <Button
                            title="Back to Welcome"
                            onPress={handleBackToWelcome}
                        />
                        <View style={styles.buttonSpacing} />
                    </>
                )}
                
                <Button 
                    title={isGuest ? "Exit Guest Mode" : "Sign Out"} 
                    onPress={logout}
                    color={isGuest ? "#007AFF" : "#FF3B30"}
                />
            </View>

            {isGuest && (
                <Text style={styles.guestInfo}>
                    You're using Guest Mode. Sync to cloud to save your reminders permanently.
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        padding: 24,
        justifyContent: 'flex-start'
    },
    name: { 
        fontSize: 20, 
        fontWeight: "bold", 
        marginBottom: 30,
        textAlign: 'center'
    },
    buttonContainer: {
        marginTop: 20
    },
    buttonSpacing: {
        height: 15
    },
    guestInfo: {
        marginTop: 30,
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        fontStyle: 'italic'
    }
});