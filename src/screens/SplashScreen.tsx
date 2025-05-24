import React, { useEffect } from "react";
import { View, Image, ActivityIndicator, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
    Splash: undefined;
    Welcome: undefined;
    Home: undefined;
    CreateReminder: undefined;
    Profile: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SplashScreen() {
    const { verifyUser, isGuest } = useAuth();
    const navigation = useNavigation<NavigationProp>();

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const isVerified = await verifyUser();
                if (isVerified || isGuest) {
                  // console.log("User is verified or in guest mode");
                    navigation.reset({
                        index: 0,
                        routes: [{ name: "Home" }],
                    });
                } else {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: "Welcome" }],
                    });
                }
            } catch (error) {
              // console.log("Verification failed:", error);
                navigation.reset({
                    index: 0,
                    routes: [{ name: "Welcome" }],
                });
            }
        };

        checkAuthStatus();
    }, []);

    return (
        <View style={styles.container}>
            <Image
                source={require("@/assets/logo.png")} // your app logo here
                style={styles.logo}
                resizeMode="contain"
                alt="App Logo"
            />
            <ActivityIndicator size="large" color="#007AFF" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center" },
    logo: { width: 200, height: 200, marginBottom: 20 },
});
