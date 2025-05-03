import { createContext, ReactNode, useState } from "react";
import { User } from "../types/User";

const AuthContext = createContext({});

type AuthProviderProps = {
  children: ReactNode;
};

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [auth, setAuth] = useState<User | null>(null);

  const login = (refreshToken: string, user: User) => {
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(user));
    setAuth(user);
  };

  return (
    <AuthContext.Provider value={{ login }}>{children}</AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
