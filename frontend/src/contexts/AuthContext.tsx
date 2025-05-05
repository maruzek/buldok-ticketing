import { createContext, ReactNode, useCallback, useState } from "react";
import { User } from "../types/User";

type AuthProviderProps = {
  children: ReactNode;
};

type AuthState = {
  user: User | null;
};

type AuthContextType = {
  auth: AuthState;
  login: (user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  auth: { user: null },
  login: () => {},
  logout: () => {},
});

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [auth, setAuth] = useState<AuthState>((): AuthState => {
    const storedUser = localStorage.getItem("user");
    return {
      user: storedUser ? JSON.parse(storedUser) : null,
    };
  });

  const login = useCallback((user: User) => {
    localStorage.setItem("user", JSON.stringify(user));
    setAuth({ user: user });
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setAuth({ user: null });

    try {
      const response = await fetch("http://localhost:8080/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("refreshToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }
      console.log("Logout successful");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ login, logout, auth }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
