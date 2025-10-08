import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

let EXPO_PUBLIC_BASE_API_URL: string | undefined;

if (Platform.OS === "web") {
  EXPO_PUBLIC_BASE_API_URL = process.env.EXPO_PUBLIC_BASE_API_URL;
} else {
  EXPO_PUBLIC_BASE_API_URL = Constants.manifest?.extra.EXPO_PUBLIC_BASE_API_URL;
}

export const API = axios.create({
  baseURL: EXPO_PUBLIC_BASE_API_URL,
});

// Health
export const getHealth = () => API.get("/health");

// Medicines
export const getMedicines = () => API.get("/medicines");
export const createMedicine = (data: any) => API.post("/medicines", data);

// Schedules
export const getSchedules = () => API.get("/schedules");
export const createSchedule = (data: any) => API.post("/schedules", data);

// Reminders
export const getReminders = () => API.get("/reminders");
