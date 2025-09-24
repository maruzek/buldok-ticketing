import { useCallback } from "react";
import useAuth from "./useAuth";
import { ApiError } from "@/types/ApiError";

const BASE_URL = import.meta.env.VITE_API_URL;

type ApiHook = {
  fetchData: <T>(endpoint: string, options: RequestInit) => Promise<T>;
  // isLoading: boolean;
  // error: string | null;
};

const useApi = (): ApiHook => {
  // const [isLoading, setIsLoading] = useState<boolean>(false);
  // const [error, setError] = useState<string | null>(null);

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

        // if (response.status === 401) {
        //   setError("Byli jste odhlášeni. Přihlašte se prosím znovu.");
        //   let err = new Error(
        //     "Byli jste odhlášeni. Přihlašte se prosím znovu."
        //   );

        //   if (!auth.user) {
        //     setError(
        //       "Nesprávné uživatelské jméno nebo heslo, nebo vašemu účtu chybí ověření od správce."
        //     );
        //     err = new Error(
        //       "Nesprávné uživatelské jméno nebo heslo, nebo vašemu účtu chybí ověření od správce."
        //     );
        //   }

        //   logout();
        //   throw err;
        // }

        // if (response.status === 403) {
        //   setError("Nemáte oprávnění k této akci.");
        //   throw new Error("Nemáte oprávnění k této akci.");
        // }

        // if (!response.ok) {
        //   const errorBody = await response.json();
        //   let backendError =
        //     errorBody.message ?? JSON.stringify(errorBody.message);
        //   backendError = backendError ? backendError : errorBody?.detail;
        //   console.log("Backend Error:", errorBody);

        //   throw new Error(
        //     `Error: Při načítání dat došlo k chybě ${response.status} - ${backendError}`
        //   );
        // }

        if (
          response.status === 204 ||
          response.headers.get("Content-Length") === "0"
        ) {
          return undefined as T;
        }

        return (await response.json()) as T;
      } catch (err) {
        // let message: string;
        // if (err instanceof Error) {
        //   message = err.message;
        // } else if (typeof err === "string") {
        //   message = err;
        // } else {
        //   message = "Nastala neznámá chyba.";
        // }

        // console.error("API Hook Error:", message);
        // setError(message);
        console.error("API Hook Error:", err);
        throw err;
      }
    },
    [logout]
  );

  return { fetchData };
};

export default useApi;
