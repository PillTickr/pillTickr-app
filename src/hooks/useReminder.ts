import * as React from "react";
import storage from "@/src/storage/storage";
import { useAuth } from "@/src/context/AuthContext";
import { Reminder } from "@/types";

const LOCAL_KEY = "REMINDERS";

type FrontendReminder = {
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

export function useReminders() {
    const { isGuest, verifyUser, token } = useAuth();
    const [reminders, setReminders] = React.useState<FrontendReminder[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    // const [token, setToken] = React.useState<string | null>(null);
    const [syncing, setSyncing] = React.useState(false);

    const apiUrl = "http://192.168.1.17:8080/api/reminders";
    const localId = () => crypto.randomUUID();

    React.useEffect(() => {
        const fetchToken = async () => {
            try {
                const storedToken = await storage.getItem("token");
                // console.log("Stored token in useReminders:", storedToken);
                if (!storedToken) {
                    // setToken(null);
                    return;
                }
                const valid = await verifyUser();
                // console.log("Token verification result:", valid);
                if (valid) {
                    // setToken(storedToken);
                    await getReminders();
                } else {
                    // setToken(null);
                    console.warn(
                        "Token verification failed, falling back to local storage"
                    );
                }
            } catch (err) {
                console.error("Error fetching token:", err);
                // setToken(null);
            }
        };
        fetchToken();
    }, [verifyUser]);

    const syncLocalReminders = async (authToken?: string) => {
        if (isGuest || (!token && !authToken)) return;

        setSyncing(true);
        try {
            const localReminders = await storage.getItem(LOCAL_KEY);
            if (!localReminders) return;

            const reminders = JSON.parse(localReminders as string);
            if (!Array.isArray(reminders) || reminders.length === 0) return;

            // console.log(
            //     `Syncing ${reminders.length} local reminders to backend`
            // );

            const tokenToUse = authToken || token;

            for (const reminder of reminders) {
                try {
                    const { id, ...reminderData } = reminder;
                    const response = await fetch(apiUrl, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${tokenToUse}`,
                        },
                        body: JSON.stringify(reminderData),
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        console.warn(
                            `Failed to sync reminder "${reminder.name}":`,
                            errorData.error
                        );
                    } else {
                        // console.log(
                        //     `Successfully synced reminder: ${reminder.name}`
                        // );
                    }
                } catch (err) {
                    console.warn(
                        `Error syncing reminder "${reminder.name}":`,
                        err
                    );
                }
            }

            await storage.removeItem(LOCAL_KEY);
            // console.log("Local reminders cleared after sync");

            await getReminders();
        } catch (error) {
            console.error("Error syncing local reminders:", error);
        } finally {
            setSyncing(false);
        }
    };

    const getReminders = async (): Promise<FrontendReminder[]> => {
        setLoading(true);
        setError(null);
        // console.log(
        //     "getReminders called, isGuest:",
        //     isGuest,
        //     "token:",
        //     !!token
        // );
        try {
            let data: Reminder[];
            if (isGuest || !token) {
                const stored = await storage.getItem(LOCAL_KEY);
                data = stored ? JSON.parse(stored) : [];
                // console.log("Local reminders:", data);
            } else {
                // console.log("Fetching from backend with token:", token);
                const res = await fetch(apiUrl, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                // console.log("Backend response status:", res.status);
                data = await res.json();
                if (!res.ok) {
                    console.error("Backend error:", data);
                    throw new Error(JSON.stringify(data) || "Fetch failed");
                }
                // console.log("Backend reminders:", data);
            }
            const transformed: FrontendReminder[] = data.map((r) => ({
                id: r.id,
                name: r.name,
                dosage: r.doses?.map((dose) => dose.dosage).join(", ") || "",
                times: r.doses?.map((dose) => dose.time) || [],
                startDate: r.start_date,
                endDate: r.end_date || "",
                notes: r.notes || undefined,
                isRecurring: r.is_recurring,
                isActive: r.is_active,
            }));
            setReminders(transformed);
            return transformed;
        } catch (err: any) {
            console.error("getReminders error:", err.message);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const createReminder = async (
        reminder: Omit<Reminder, "id" | "created_at" | "user_id">
    ) => {
        setLoading(true);
        setError(null);
        try {
            if (isGuest || !token) {
                const newReminder: Reminder = {
                    ...reminder,
                    id: localId(),
                    created_at: new Date().toISOString(),
                    user_id: "guest",
                    doses: reminder.doses || [],
                };
                const stored = await storage.getItem(LOCAL_KEY);
                const existing = stored ? JSON.parse(stored) : [];
                const updated = [...existing, newReminder];
                await storage.setItem(LOCAL_KEY, JSON.stringify(updated));
                const transformed: FrontendReminder = {
                    id: newReminder.id,
                    name: newReminder.name,
                    dosage:
                        newReminder.doses
                            ?.map((dose) => dose.dosage)
                            .join(", ") || "",
                    times: newReminder.doses?.map((dose) => dose.time) || [],
                    startDate: newReminder.start_date,
                    endDate: newReminder.end_date || "",
                    notes: newReminder.notes || undefined,
                    isRecurring: newReminder.is_recurring,
                    isActive: newReminder.is_active,
                };
                setReminders([...reminders, transformed]);
                return transformed;
            } else {
                const res = await fetch(apiUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(reminder),
                });
                const data: Reminder = await res.json();
                if (!res.ok)
                    throw new Error(JSON.stringify(data) || "Create failed");
                const transformed: FrontendReminder = {
                    id: data.id,
                    name: data.name,
                    dosage:
                        data.doses?.map((dose) => dose.dosage).join(", ") || "",
                    times: data.doses?.map((dose) => dose.time) || [],
                    startDate: data.start_date,
                    endDate: data.end_date || "",
                    notes: data.notes || undefined,
                    isRecurring: data.is_recurring,
                    isActive: data.is_active,
                };
                setReminders([...reminders, transformed]);
                return transformed;
            }
        } catch (err: any) {
            console.error("createReminder error:", err.message);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateReminder = async (id: string, update: Partial<Reminder>) => {
        setLoading(true);
        setError(null);
        try {
            if (isGuest || !token) {
                const stored = await storage.getItem(LOCAL_KEY);
                const existing = stored ? JSON.parse(stored) : [];
                const updatedList = existing.map((r: Reminder) =>
                    r.id === id ? { ...r, ...update } : r
                );
                await storage.setItem(LOCAL_KEY, JSON.stringify(updatedList));
                const transformed: FrontendReminder[] = updatedList.map(
                    (r: Reminder) => ({
                        id: r.id,
                        name: r.name,
                        dosage:
                            r.doses?.map((dose) => dose.dosage).join(", ") ||
                            "",
                        times: r.doses?.map((dose) => dose.time) || [],
                        startDate: r.start_date,
                        endDate: r.end_date || "",
                        notes: r.notes || undefined,
                        isRecurring: r.is_recurring,
                        isActive: r.is_active,
                    })
                );
                setReminders(transformed);
                return transformed.find((r) => r.id === id);
            } else {
                const res = await fetch(`${apiUrl}/${id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(update),
                });
                const data: Reminder = await res.json();
                if (!res.ok)
                    throw new Error(JSON.stringify(data) || "Update failed");
                const transformed: FrontendReminder = {
                    id: data.id,
                    name: data.name,
                    dosage:
                        data.doses?.map((dose) => dose.dosage).join(", ") || "",
                    times: data.doses?.map((dose) => dose.time) || [],
                    startDate: data.start_date,
                    endDate: data.end_date || "",
                    notes: data.notes || undefined,
                    isRecurring: data.is_recurring,
                    isActive: data.is_active,
                };
                setReminders(
                    reminders.map((r) => (r.id === id ? transformed : r))
                );
                return transformed;
            }
        } catch (err: any) {
            console.error("updateReminder error:", err.message);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteReminder = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            if (isGuest || !token) {
                const stored = await storage.getItem(LOCAL_KEY);
                const existing = stored ? JSON.parse(stored) : [];
                const updated = existing.filter((r: Reminder) => r.id !== id);
                await storage.setItem(LOCAL_KEY, JSON.stringify(updated));
                const transformed: FrontendReminder[] = updated.map(
                    (r: Reminder) => ({
                        id: r.id,
                        name: r.name,
                        dosage:
                            r.doses?.map((dose) => dose.dosage).join(", ") ||
                            "",
                        times: r.doses?.map((dose) => dose.time) || [],
                        startDate: r.start_date,
                        endDate: r.end_date || "",
                        notes: r.notes || undefined,
                        isRecurring: r.is_recurring,
                        isActive: r.is_active,
                    })
                );
                setReminders(transformed);
            } else {
                const res = await fetch(`${apiUrl}/${id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || "Delete failed");
                }
                setReminders(reminders.filter((r) => r.id !== id));
            }
        } catch (err: any) {
            console.error("deleteReminder error:", err.message);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        getReminders,
        createReminder,
        updateReminder,
        deleteReminder,
        syncLocalReminders,
        reminders,
        loading,
        error,
        syncing,
    };
}
