import { useCallback } from "react";
import useAuth from "./useAuth";
import { ApiError } from "@/types/ApiError";

const BASE_URL = import.meta.env.VITE_API_URL;

type FetchOptions = RequestInit & {
  skipAuthRefresh?: boolean;
};

type ApiHook = {
  fetchData: <T>(endpoint: string, options: RequestInit) => Promise<T>;
};

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

const useApi = (): ApiHook => {
  const { logout } = useAuth();

  const refreshToken = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch(`${BASE_URL}/token/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to refresh token");
      }
    } catch (error) {
      console.error("Token refresh failed, logging out.", error);
      logout();
      throw error;
    }
  }, [logout]);

  const fetchData = useCallback(
    async <T>(endpoint: string, options: FetchOptions = {}): Promise<T> => {
      const { skipAuthRefresh, ...fetchOptions } = options;
      const makeRequest = async (): Promise<Response> => {
        const requestOptions: RequestInit = {
          ...fetchOptions,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...fetchOptions.headers,
          },
          credentials: "include",
        };
        return fetch(`${BASE_URL}${endpoint}`, requestOptions);
      };
      try {
        // const fetchOptions: RequestInit = {
        //   ...options,
        //   headers: {
        //     "Content-Type": "application/json",
        //     Accept: "application/json",
        //     ...options.headers,
        //   },
        //   credentials: "include",
        // };

        // const response: Response = await fetch(
        //   `${BASE_URL}${endpoint}`,
        //   fetchOptions
        // );
        let response = await makeRequest();

        if (response.status === 401 && !skipAuthRefresh) {
          if (!isRefreshing) {
            isRefreshing = true;
            refreshPromise = refreshToken().finally(() => {
              isRefreshing = false;
              refreshPromise = null;
            });
          }

          await refreshPromise;

          response = await makeRequest();
        }

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
    [logout, refreshToken]
  );

  return { fetchData };
};

export default useApi;
