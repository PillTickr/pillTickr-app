import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./src/screens/HomeScreen";
import CreateReminderScreen from "./src/screens/CreateReminderScreen";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { useState, useEffect, useRef } from "react";
import { Text, View, Button, Platform } from "react-native";
import Constants from "expo-constants";

const Stack = createNativeStackNavigator();
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export default function App() {
    const [expoPushToken, setExpoPushToken] = useState("");
    const [channels, setChannels] = useState<
        Notifications.NotificationChannel[]
    >([]);
    const [notification, setNotification] = useState<
        Notifications.Notification | undefined
    >(undefined);
    const notificationListener = useRef<Notifications.EventSubscription | null>(null);
    const responseListener = useRef<Notifications.EventSubscription | null>(null);
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
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Home">
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen
                    name="CreateReminder"
                    component={CreateReminderScreen}
                    options={{ title: "New Reminder" }}
                />
            </Stack.Navigator>
        </NavigationContainer>
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
        // Learn more about projectId:
        // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
        // EAS projectId is used here.
        try {
            const projectId =
                Constants?.expoConfig?.extra?.eas?.projectId ??
                Constants?.easConfig?.projectId;
            if (!projectId) {
                throw new Error("Project ID not found");
            }
            token = (
                await Notifications.getExpoPushTokenAsync({
                    projectId,
                })
            ).data;
            console.log(token);
        } catch (e) {
            token = `${e}`;
        }
    } else {
        alert("Must use physical device for Push Notifications");
    }

    return token;
}
