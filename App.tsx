import React, { useState, useRef, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import SplashScreen from "./src/screens/SplashScreen";
import HomeScreen from "./src/screens/HomeScreen";
import CreateReminderScreen from "./src/screens/CreateReminderScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import SignInScreen from "./src/screens/SignInScreen";
import WelcomeScreen from "./src/screens/WelcomeScreen";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import SignUpScreen from "./src/screens/SignUpScreen"; // Placeholder for settings screen

const Drawer = createDrawerNavigator();

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

function AppDrawer() {
    const { name, isLoading, isGuest } = useAuth();
    const [expoPushToken, setExpoPushToken] = useState("");
    const [channels, setChannels] = useState<
        Notifications.NotificationChannel[]
    >([]);
    const [notification, setNotification] = useState<
        Notifications.Notification | undefined
    >(undefined);
    const notificationListener = useRef<Notifications.EventSubscription | null>(
        null
    );
    const responseListener = useRef<Notifications.EventSubscription | null>(
        null
    );

    useEffect(() => {
        registerForPushNotificationsAsync().then(
            (token) => token && setExpoPushToken(token)
        );

        if (Platform.OS === "android") {
            Notifications.getNotificationChannelsAsync().then((value) =>
                setChannels(value ?? [])
            );
        }

        notificationListener.current =
            Notifications.addNotificationReceivedListener((notification) => {
                setNotification(notification);
            });

        responseListener.current =
            Notifications.addNotificationResponseReceivedListener(
                (response) => {
                    console.log(response);
                }
            );

        return () => {
            notificationListener.current &&
                Notifications.removeNotificationSubscription(
                    notificationListener.current
                );
            responseListener.current &&
                Notifications.removeNotificationSubscription(
                    responseListener.current
                );
        };
    }, []);

    useEffect(() => {
        Notifications.requestPermissionsAsync().then((status) => {
            if (status.granted !== true) {
                alert("Please enable notifications in settings.");
            }
        });
    }, []);

    // Show loading screen while auth state is being determined
    if (isLoading) {
        return <SplashScreen />;
    }

    // Determine initial route based on auth state
    const getInitialRouteName = () => {
        // If we have a name (either guest or authenticated user), go to Home
        // Otherwise start with Splash
        return name ? "Home" : "Splash";
    };

    return (
        <Drawer.Navigator
            initialRouteName={getInitialRouteName()}
            screenOptions={({ route }) => ({
                headerShown: true,
                drawerPosition: "left",
                // Hide drawer for auth screens
                swipeEnabled: ![
                    "Splash",
                    "Welcome",
                    "SignIn",
                    "SignUpScreen",
                ].includes(route.name),
                drawerItemStyle: [
                    "Splash",
                    "Welcome",
                    "SignIn",
                    "SignUpScreen",
                ].includes(route.name)
                    ? { display: "none" }
                    : undefined,
            })}
        >
            {/* Auth Flow Screens */}
            <Drawer.Screen
                name="Splash"
                component={SplashScreen}
                options={{
                    headerShown: false,
                    drawerItemStyle: { display: "none" },
                }}
            />
            <Drawer.Screen
                name="Welcome"
                component={WelcomeScreen}
                options={{
                    headerShown: false,
                    drawerItemStyle: { display: "none" },
                }}
            />
            <Drawer.Screen
                name="SignIn"
                component={SignInScreen}
                options={{
                    headerShown: false,
                    drawerItemStyle: { display: "none" },
                }}
            />
            <Drawer.Screen
                name="SignUpScreen"
                component={SignUpScreen}
                options={{
                    headerShown: false,
                    drawerItemStyle: { display: "none" },
                }}
            />

            {/* Main App Screens */}
            <Drawer.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    title: "Home",
                    drawerLabel: "Home",
                }}
            />
            <Drawer.Screen
                name="CreateReminder"
                component={CreateReminderScreen}
                options={{
                    title: "Create Reminder",
                    drawerLabel: "Create Reminder",
                }}
            />

            <Drawer.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    title: "Profile",
                    drawerLabel: "Profile",
                }}
            />
        </Drawer.Navigator>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <NavigationContainer>
                <AppDrawer />
            </NavigationContainer>
        </AuthProvider>
    );
}

async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync(
            "myNotificationChannel",
            {
                name: "A channel is needed for the permissions prompt to appear",
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: "#FF231F7C",
            }
        );
    }

    if (Device.isDevice) {
        const { status: existingStatus } =
            await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== "granted") {
            alert("Failed to get push token for push notification!");
            return;
        }

        try {
            const projectId =
                Constants?.expoConfig?.extra?.eas?.projectId ??
                Constants?.easConfig?.projectId;
            if (!projectId) throw new Error("Project ID not found");

            token = (await Notifications.getExpoPushTokenAsync({ projectId }))
                .data;
            // console.log(token);
        } catch (e) {
            token = `${e}`;
        }
    } else {
        alert("Must use physical device for Push Notifications");
    }

    return token;
}
