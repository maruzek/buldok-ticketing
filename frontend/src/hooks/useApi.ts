import { useCallback, useState } from "react";
import useAuth from "./useAuth";

const BASE_URL = import.meta.env.VITE_API_URL;

type ApiHook = {
  fetchData: <T>(endpoint: string, options: RequestInit) => Promise<T>;
  isLoading: boolean;
  error: string | null;
};

const useApi = (): ApiHook => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { logout } = useAuth();

  const fetchData = useCallback(
    async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
      setIsLoading(true);
      setError(null);

      try {
        const response: Response = await fetch(`${BASE_URL}${endpoint}`, {
          ...options,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...options.headers,
          },
          credentials: "include",
        });

        if (response.status === 401) {
          setError("Byli jste odhlášeni. Přihlašte se prosím znovu.");
          logout();
          throw new Error("Byli jste odhlášeni. Přihlašte se prosím znovu.");
        }

        if (!response.ok) {
          throw new Error(
            `Error: Při načítání dat došlo k chybě ${response.status}`
          );
        }

        if (
          response.status === 204 ||
          response.headers.get("Content-Length") === "0"
        ) {
          return undefined as T;
        }

        const data = (await response.json()) as T;
        return data;
      } catch (err: unknown) {
        let message: string;
        if (err instanceof Error) {
          message = err.message;
        } else if (typeof err === "string") {
          message = err;
        } else {
          message = "An unknown error occurred during the API request.";
        }

        console.error("API Hook Error:", message);
        setError(message);

        throw new Error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [logout]
  );

  return { fetchData, isLoading, error };
};

export default useApi;
