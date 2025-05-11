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
  login: () => { },
  logout: () => { },
});

// es-lint-disable-next-line @typescript-eslint/no-explicit-any
const isValidUser = (obj: any): obj is User => {
  return (
    obj &&
    typeof obj === "object" &&
    "id" in obj &&
    "email" in obj &&
    Array.isArray(obj.roles)
  );
};

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [auth, setAuth] = useState<AuthState>((): AuthState => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (isValidUser(parsedUser)) {
        return { user: parsedUser };
      }
    }
    return {
      user: null,
    };
  });

  const login = useCallback((user: User) => {
    if (!isValidUser(user)) {
      console.error("Invalid user object:", user);
      return;
    }
    localStorage.setItem("user", JSON.stringify(user));
    setAuth({ user: user });
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem("user");
    setAuth({ user: null });

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }
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
