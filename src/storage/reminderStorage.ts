import AsyncStorage from "@react-native-async-storage/async-storage";

const REMINDER_KEY = "REMINDERS";

export async function saveReminder(reminder: any) {
  const existing = await AsyncStorage.getItem(REMINDER_KEY);
  const reminders = existing ? JSON.parse(existing) : [];
  reminders.push(reminder);
  await AsyncStorage.setItem(REMINDER_KEY, JSON.stringify(reminders));
}

export async function getReminders() {
  const result = await AsyncStorage.getItem(REMINDER_KEY);
  return result ? JSON.parse(result) : [];
}
