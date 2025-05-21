import React, { createContext, useContext, useState } from "react";

type AuthContextType = {
  isGuest: boolean;
  name: string;
  isSyncEnabled: boolean;
  signIn: (name: string, guest?: boolean) => void;
  signOut: () => void;
  toggleSync: (enabled: boolean) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isGuest, setIsGuest] = useState(true);
  const [name, setName] = useState("Guest");
  const [isSyncEnabled, setSyncEnabled] = useState(false);

  const signIn = (userName: string, guest = false) => {
    setName(userName);
    setIsGuest(guest);
  };

  const signOut = () => {
    setName("Guest");
    setIsGuest(true);
    setSyncEnabled(false);
  };

  const toggleSync = (enabled: boolean) => {
    setSyncEnabled(enabled);
  };

  return (
    <AuthContext.Provider value={{ isGuest, name, isSyncEnabled, signIn, signOut, toggleSync }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;
