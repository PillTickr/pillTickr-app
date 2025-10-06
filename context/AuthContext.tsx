import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

type AuthContextType = {
  user: any | null;
  token: string | null;
  login: (token: string, user: any) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();

  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const loadAuth = async () => {
      const authData = await AsyncStorage.getItem("auth");
      if (authData) {
        console.log(authData);
        // TODO: validate token (e.g., check expiry)
        const { token, user } = JSON.parse(authData);
        setToken(token);
        setUser(user);
      } else {
        router.push("/(auth)/login");
      }
    };
    loadAuth();
  }, [router]);

  const login = async (token: string, user: any) => {
    setToken(token);
    setUser(user);
    await AsyncStorage.setItem("auth", JSON.stringify({ token, user }));
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem("auth");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
