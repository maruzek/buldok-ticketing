import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { FieldValues, useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import useApi from "@/hooks/useApi";
import { User } from "@/types/User";
import useAuth from "@/hooks/useAuth";
import { toast } from "sonner";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { useEffect } from "react";

export function LoginForm({ className }: React.ComponentProps<"form">) {
  const { fetchData } = useApi();
  const navigate = useNavigate();
  const { login, auth } = useAuth();
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const [searchParams] = useSearchParams();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FieldValues) => {
      return fetchData<{ user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
        skipAuthRefresh: true,
      });
    },
    onSuccess: (data) => {
      login(data.user);
      if (!data.user) {
        form.setError("email", {
          type: "manual",
          message:
            "Nesprávné uživatelské jméno nebo heslo, nebo vašemu účtu chybí ověření od správce.",
        });
        return;
      }
      toast.success("Byli jste úspěšně přihlášeni.");
      // if (data.user.roles.includes("ROLE_ADMIN")) {
      //   navigate("/admin");
      //   return;
      // }
      // navigate("/app");
    },
    onError: (error) => {
      console.error("Login failed:", error);
      form.setError("root", {
        type: "manual",
        message: error.message as string,
      });
    },
  });

  useEffect(() => {
    const reason = searchParams.get("reason");
    if (reason === "unauthenticated") {
      form.setError("root", {
        type: "manual",
        message: "Byli jste odhlášeni. Přihlašte se prosím znovu.",
      });
    } else if (reason === null) {
      form.clearErrors("root");
    }
  }, [form, navigate, searchParams]);

  useEffect(() => {
    if (auth.user) {
      if (auth.user.roles.includes("ROLE_ADMIN")) {
        navigate("/admin");
      } else {
        navigate("/app");
      }
    }
  }, [auth.user, navigate]);

  return (
    <Form {...form}>
      <form
        className={cn("flex flex-col gap-6", className)}
        onSubmit={form.handleSubmit((data) => mutate(data))}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Přihlášení do ticketingu</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Přihlaste se pomocí svého emailu a hesla.
          </p>
          {form.formState.errors.root && (
            <Alert variant={"destructive"}>
              <AlertCircleIcon />
              {/* <AlertTitle>Chyba při přihlášení</AlertTitle> */}
              <AlertDescription>
                {form.formState.errors.root.message}
              </AlertDescription>
            </Alert>
          )}
        </div>
        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center">
                  <FormLabel>Heslo</FormLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Zapomenuté heslo?
                  </a>
                </div>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isPending}>
            Přihlásit se
          </Button>
          {/* <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            Or continue with
          </span>
        </div>
        <Button variant="outline" className="w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path
              d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
              fill="currentColor"
            />
          </svg>
          Login with GitHub
        </Button> */}
        </div>
        <div className="text-center text-sm">
          <Link to="/register" className="w-full">
            <Button className="w-full" variant="outline">
              Registrace
            </Button>
          </Link>
        </div>
      </form>
    </Form>
  );
}
