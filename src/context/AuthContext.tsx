// src/context/AuthContext.tsx
import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import storage from "@/src/storage/storage";
import { Form, Methods, User } from "@/types";

type AuthContextType = {
    isGuest: boolean;
    name: string;
    isSyncEnabled: boolean;
    signIn: (method: Methods, details?: Form | string) => Promise<void>;
    logout: () => Promise<void>;
    signup: (input: Form) => Promise<{ access_token: string; user: User }>;
    toggleSync: (enabled: boolean) => void;
    isLoading: boolean; // Changed from loading to isLoading for navigation compatibility
    error: string | null;
    verifyUser: () => Promise<boolean>;
    user: User | null;
    token: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // State
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Changed from loading
    const [error, setError] = useState<string | null>(null);

    const [isGuest, setIsGuest] = useState(false);
    const [name, setName] = useState("");
    const [isSyncEnabled, setSyncEnabled] = useState(false);

    // Initialize auth on mount
    useEffect(() => {
        const initAuth = async () => {
            try {
                setIsLoading(true);
                const storedToken = await storage.getItem("token");
                const storedUserString = await storage.getItem("user");

                // Parse the stored user string
                const storedUser = storedUserString
                    ? JSON.parse(storedUserString as string)
                    : null;

                // console.log("Stored token:", storedToken);
                // console.log("Stored user:", storedUser);

                if (storedToken && storedUser) {
                    setToken(storedToken);
                    // Verify token validity
                    // console.log("Verifying token:", storedToken);
                    const isValid = await verify(storedToken);
                    if (isValid) {
                        setUser(storedUser);
                        setName(storedUser?.display_name || "");
                        // console.log("User is guest:", !!storedUser?.is_guest);
                        setIsGuest(!!storedUser?.is_guest);
                        // setSyncEnabled(!!storedUser?.sync_enabled);
                    } else {
                        // Token is invalid, clear state
                        console.warn("Invalid token, clearing auth state");
                        await storage.removeItem("token");
                        await storage.removeItem("user");
                        setToken(null);
                        setUser(null);
                        setName("");
                        setIsGuest(false);
                    }
                } else {
                    // console.log("No token found, checking guest mode");
                    // No token found, check if user is in guest mode
                    // console.log("Parsed user:", storedUser);
                    // console.log("Is guest:", storedUser?.is_guest);
                    const guestUser = storedUser && storedUser.is_guest;
                    // console.log("Guest user status:", guestUser);
                    if (guestUser) {
                        setIsGuest(true);
                        setName(storedUser.display_name || "Guest");
                        setUser(storedUser);
                        // console.log("Guest user found:", storedUser);
                    } else {
                        // No user data, start fresh
                        setIsGuest(false);
                        setName("");
                        setUser(null);
                        // console.log("No user data found, starting fresh");
                    }
                }
            } catch (err: any) {
                console.error("Auth initialization error:", err);
                setError("Failed to load auth data: " + err.message);
                // Clear state on error
                setToken(null);
                setUser(null);
                setName("");
                setIsGuest(false);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    // Signup (email/password)
    const signup = async (
        input: Form
    ): Promise<{ access_token: string; user: User }> => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(
                "http://192.168.1.17:8080/api/auth/signup",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(input),
                }
            );
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Signup failed");

            const userWithRefreshToken = {
                ...data.user,
                refresh_token: data.refresh_token,
            };

            await storage.setItem("token", data.access_token);
            await storage.setItem("user", JSON.stringify(userWithRefreshToken));

            setToken(data.access_token);
            setUser(data.user);
            setName(data.user.display_name || "");
            setIsGuest(false);

            // Sync local reminders after successful signup
            await syncLocalReminders(data.access_token);

            return data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Login (email/password)
    const login = async (input: {
        email: string;
        password: string;
    }): Promise<{ access_token: string; user: User }> => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(
                "http://192.168.1.17:8080/api/auth/login",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(input),
                }
            );
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Login failed");

            const userWithRefreshToken = {
                ...data.user,
                refresh_token: data.refresh_token,
            };

            await storage.setItem("token", data.access_token);
            await storage.setItem("user", JSON.stringify(userWithRefreshToken));

            setToken(data.access_token);
            setUser(data.user);
            setName(data.user.display_name || "");
            setIsGuest(false);

            // Sync local reminders after successful login
            await syncLocalReminders(data.access_token);

            return data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Logout
    const logout = async () => {
        try {
            setIsLoading(true);
            await storage.removeItem("token");
            await storage.removeItem("user");

            setToken(null);
            setUser(null);
            setName("");
            setIsGuest(false);
            setSyncEnabled(false);
            setError(null);
        } catch (err: any) {
            console.error("Logout error:", err);
            setError("Failed to logout: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const refreshToken = async (): Promise<boolean> => {
        try {
            const storedUserString = await storage.getItem("user");
            const user = storedUserString
                ? JSON.parse(storedUserString as string)
                : null;
            const refresh_token = user?.refresh_token;

            if (!refresh_token) throw new Error("No refresh token found");

            const response = await fetch(
                "http://192.168.1.17:8080/api/auth/refresh",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refresh_token }),
                }
            );

            if (!response.ok) throw new Error("Token refresh failed");

            const data = await response.json();
            const userWithRefreshToken = {
                ...data.user,
                refresh_token: data.refresh_token || refresh_token, // Keep old refresh token if new one not provided
            };

            await storage.setItem("token", data.access_token);
            await storage.setItem("user", JSON.stringify(userWithRefreshToken));

            setToken(data.access_token);
            setUser(data.user);
            setName(data.user.display_name || "");
            setIsGuest(false);

            return true;
        } catch (err: any) {
            console.error("Refresh token failed:", err.message);
            return false;
        }
    };

    // Verify token validity
    const verify = async (tokenToUse: string): Promise<boolean> => {
        if (!tokenToUse) return false;

        try {
            const response = await fetch(
                "http://192.168.1.17:8080/api/auth/verify",
                {
                    headers: { Authorization: `Bearer ${tokenToUse}` },
                }
            );

            if (response.ok) {
                const data = await response.json();
                if (data.user) {
                    // Update user data from verification
                    const currentUserString = await storage.getItem("user");
                    const parsedUser = currentUserString
                        ? JSON.parse(currentUserString as string)
                        : {};
                    const userWithRefreshToken = {
                        ...data.user,
                        refresh_token:
                            parsedUser.refresh_token || data.refresh_token,
                    };

                    await storage.setItem(
                        "user",
                        JSON.stringify(userWithRefreshToken)
                    );
                    setUser(data.user);
                    setName(data.user.display_name || "");
                    setIsGuest(false);
                }
                return true;
            } else if (response.status === 401) {
                // Token expired, try refreshing
                // console.log("Token expired, attempting refresh");
                const refreshed = await refreshToken();
                return refreshed;
            } else {
                throw new Error("Token verification failed");
            }
        } catch (err: any) {
            console.warn("Token verification failed:", err.message);
            return false;
        }
    };

    const verifyUser = async (): Promise<boolean> => {
        const tokenToUse = token || (await storage.getItem("token"));
        if (!tokenToUse) return false;
        return verify(tokenToUse);
    };

    // Sync local reminders to backend
    const syncLocalReminders = async (authToken: string) => {
        try {
            const localReminders = await storage.getItem("REMINDERS");
            if (!localReminders) return;

            const reminders = JSON.parse(localReminders as string);
            if (!Array.isArray(reminders) || reminders.length === 0) return;

            // console.log(
            //     `Syncing ${reminders.length} local reminders to backend`
            // );

            // Push each reminder to the backend
            for (const reminder of reminders) {
                try {
                    const { id, ...reminderData } = reminder; // Remove local ID
                    const response = await fetch(
                        "http://192.168.1.17:8080/api/reminders",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${authToken}`,
                            },
                            body: JSON.stringify(reminderData),
                        }
                    );

                    if (!response.ok) {
                        const errorData = await response.json();
                        console.warn(
                            `Failed to sync reminder "${reminder.title}":`,
                            errorData.error
                        );
                    } else {
                        // console.log(
                        //     `Successfully synced reminder: ${reminder.title}`
                        // );
                    }
                } catch (err) {
                    console.warn(
                        `Error syncing reminder "${reminder.title}":`,
                        err
                    );
                }
            }

            // Clear local reminders after successful sync
            await storage.removeItem("REMINDERS");
            // console.log("Local reminders cleared after sync");
        } catch (error) {
            console.error("Error syncing local reminders:", error);
        }
    };

    // signIn wrapper
    const signIn = async (
        method: Methods,
        details?: Form | string
    ): Promise<void> => {
        setError(null);
        try {
            if (
                method === Methods.EMAIL &&
                details &&
                typeof details !== "string"
            ) {
                const result = await login(details);
                // Sync local reminders after successful login
                if (result.access_token) {
                    await syncLocalReminders(result.access_token);
                }
            } else if (method === Methods.GOOGLE) {
                // TODO: implement Google sign-in logic here
                // console.log("Google sign-in not implemented");
                setName("Google User");
                setIsGuest(false);
                // For now, create a mock user
                const mockUser = {
                    display_name: "Google User",
                    id: "google_user",
                };
                await storage.setItem("user", JSON.stringify(mockUser));
                setUser(mockUser as User);
                // Note: When Google sign-in is implemented, add sync here too
            } else if (method === Methods.APPLE) {
                // TODO: implement Apple sign-in logic here
                // console.log("Apple sign-in not implemented");
                setName("Apple User");
                setIsGuest(false);
                // For now, create a mock user
                const mockUser = {
                    display_name: "Apple User",
                    id: "apple_user",
                };
                await storage.setItem("user", JSON.stringify(mockUser));
                setUser(mockUser as User);
                // Note: When Apple sign-in is implemented, add sync here too
            } else if (
                method === Methods.GUEST &&
                typeof details === "string"
            ) {
                const guestName = details || "Guest";
                const guestUser = {
                    display_name: guestName,
                    is_guest: true,
                    id: "guest_user",
                };

                setName(guestName);
                setIsGuest(true);
                setUser(guestUser as User);
                await storage.setItem("user", JSON.stringify(guestUser));
            } else {
                throw new Error("Invalid sign-in method or details");
            }
        } catch (error) {
            console.error("Sign-in failed:", error);
            setError(error instanceof Error ? error.message : "Sign-in failed");
            throw error;
        }
    };

    const toggleSync = (enabled: boolean) => {
        setSyncEnabled(enabled);
        // TODO: Implement actual sync logic
    };

    return (
        <AuthContext.Provider
            value={{
                isGuest,
                name,
                isSyncEnabled,
                signIn,
                logout,
                signup,
                toggleSync,
                verifyUser,
                isLoading, // Changed from loading
                error,
                user,
                token,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error("useAuth must be used within an AuthProvider");
    return context;
};
