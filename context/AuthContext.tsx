import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { User } from "@/types/User";

type AuthContextType = {
  user?: User;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();

  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isTokenExpired = (token: string) => {
    try {
      const [, payload] = token.split(".");
      const decoded = JSON.parse(atob(payload));
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  };

  useEffect(() => {
    const refreshAccessToken = async () => {
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      if (!refreshToken) {
        console.warn("No refresh token found.");
        await logout();
        return;
      }

      try {
        const res = await axios.post("http://localhost:8090/api/auth/refresh", {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken, user } = res.data;

        await AsyncStorage.setItem("user", JSON.stringify(user));
        await AsyncStorage.setItem("accessToken", accessToken);
        await AsyncStorage.setItem("refreshToken", newRefreshToken);

        setUser(user);
      } catch (err) {
        console.error("Token refresh failed:", err);
        await logout();
      }
    };

    const loadAuth = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      const token = await AsyncStorage.getItem("accessToken");
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      if (storedUser && token && refreshToken) {
        if (isTokenExpired(token)) {
          await refreshAccessToken();
        } else {
          setUser(JSON.parse(storedUser));
        }
      } else {
        router.push("/(auth)/login");
      }
      setIsLoading(false);
    };
    loadAuth();
  }, [router]);

  // 🔐 Login logic moved here
  const login = async (email: string, password: string) => {
    try {
      const res = await axios.post("http://localhost:8090/api/auth/login", {
        email,
        password,
      });

      const { refreshToken, user, accessToken } = res.data;
      setUser(user);

      await AsyncStorage.setItem("user", JSON.stringify(user));
      await AsyncStorage.setItem("accessToken", accessToken);
      await AsyncStorage.setItem("refreshToken", refreshToken);
    } catch (err) {
      console.error("Login failed:", err);
      throw err;
    }
  };

  // 🚪 Logout
  const logout = async () => {
    setUser(null);
    await AsyncStorage.multiRemove(["user", "accessToken", "refreshToken"]);
    router.push("/(auth)/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
