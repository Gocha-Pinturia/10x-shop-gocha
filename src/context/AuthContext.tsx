import { createContext, useContext, useState, ReactNode } from "react";
import type { AuthUser } from "../types/user.ts";
import { userStorage } from "../models/StorageService.ts";

interface AuthContextType {
  user: AuthUser;
  isLoggedIn: boolean;
  login: (username: string, additional?: Partial<AuthUser>) => void;
  logout: () => void;
  updateProfile: (profile: Partial<AuthUser>) => void;
}

const defaultUser: AuthUser = {
  username: "",
  isLoggedIn: false,
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>(() => {
    const saved = userStorage.get();
    if (saved && saved.isLoggedIn) {
      return saved;
    }
    return defaultUser;
  });

  const login = (username: string, additional?: Partial<AuthUser>) => {
    const newUser: AuthUser = {
      username: username.trim(),
      isLoggedIn: true,
      firstName: additional?.firstName || username.trim(),
      lastName: additional?.lastName || "Member",
      email: additional?.email || `${username.trim().toLowerCase()}@example.com`,
      phone: additional?.phone || "+1 555-0199",
    };
    setUser(newUser);
    userStorage.set(newUser);
  };

  const logout = () => {
    setUser(defaultUser);
    userStorage.remove();
  };

  const updateProfile = (profile: Partial<AuthUser>) => {
    setUser((prev) => {
      const updated = { ...prev, ...profile };
      userStorage.set(updated);
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: user.isLoggedIn,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
