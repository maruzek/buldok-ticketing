import { useCallback } from "react";
import useAuth from "./useAuth";
import { ApiError } from "@/types/ApiError";

const BASE_URL = import.meta.env.VITE_API_URL;

type ApiHook = {
  fetchData: <T>(endpoint: string, options: RequestInit) => Promise<T>;
};

const useApi = (): ApiHook => {
  const { logout } = useAuth();

  const fetchData = useCallback(
    async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
      try {
        const fetchOptions: RequestInit = {
          ...options,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...options.headers,
          },
          credentials: "include",
        };

        const response: Response = await fetch(
          `${BASE_URL}${endpoint}`,
          fetchOptions
        );

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));

          const errorMessage =
            errorBody.detail ||
            errorBody.message ||
            `HTTP error! status: ${response.status}`;

          const error = new Error(errorMessage);

          (error as ApiError).status = response.status;
          (error as ApiError).body = errorBody;

          if (response.status === 401) {
            logout();
          }

          throw error;
        }

        if (
          response.status === 204 ||
          response.headers.get("Content-Length") === "0"
        ) {
          return undefined as T;
        }

        return (await response.json()) as T;
      } catch (err) {
        console.error("API Hook Error:", err);
        throw err;
      }
    },
    [logout]
  );

  return { fetchData };
};

export default useApi;
