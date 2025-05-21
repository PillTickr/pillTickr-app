// import * as Notifications from "expo-notifications";

// export async function schedulePushNotification(name: string, time: string) {
//     const hour = Number(time.split(":")[0]);
//     const minute = Number(time.split(":")[1]);
//     console.log("hour", hour, minute);
//     await Notifications.scheduleNotificationAsync({
//         content: {
//             title: "You've got mail! 📬",
//             body: "Here is the notification body",
//             data: { data: "goes here", test: { test1: "more data" } },
//         },
//         trigger: {
//             type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
//             hour: hour,
//             minute: minute,
//         },
//     });
// }

import * as Notifications from "expo-notifications";

/**
 * Schedule a local push notification at a specific time.
 * @param name - The name of the medicine or reminder.
 * @param time - Time string in "HH:mm" 24-hour format.
 */
export async function schedulePushNotification(name: string, time: Date) {
    // const [hour, minute] = time.split(":").map(Number);
    // const trigger = new Date();
    // trigger.setHours(hour);
    // trigger.setMinutes(minute);
    // trigger.setSeconds(0);
    console.log("Scheduling notification at", time.toISOString());
    await Notifications.scheduleNotificationAsync({
        content: {
            title: `⏰ Reminder: ${name}`,
            body: `It's time to take your ${name}`,
            sound: "default",
            priority: Notifications.AndroidNotificationPriority.HIGH,
            data: { medicine: name },
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: time,
        },
    });
}
