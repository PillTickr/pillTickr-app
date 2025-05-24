// src/utils/storage.ts
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const storage = {
    getItem: async (key: string): Promise<string | null> => {
        if (Platform.OS === "web") {
            return Promise.resolve(localStorage.getItem(key));
        } else {
            return AsyncStorage.getItem(key);
        }
    },
    setItem: async (key: string, value: string): Promise<void> => {
        if (Platform.OS === "web") {
            localStorage.setItem(key, value);
            return Promise.resolve();
        } else {
            return AsyncStorage.setItem(key, value);
        }
    },
    removeItem: async (key: string): Promise<void> => {
        if (Platform.OS === "web") {
            localStorage.removeItem(key);
            return Promise.resolve();
        } else {
            return AsyncStorage.removeItem(key);
        }
    },
};

export default storage;
