import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
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
  const location = useLocation();
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
      console.log(data);
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
    },
    onError: (error) => {
      console.error("Login failed:", error);
      form.setError("root", {
        type: "manual",
        message: error.message as string,
      });
    },
  });

  const reason = searchParams.get("reason");

  useEffect(() => {
    console.log(location.state?.from);

    if (reason === "unauthenticated") {
      form.setError("root", {
        type: "manual",
        message: "Byli jste odhlášeni. Přihlašte se prosím znovu.",
      });
    } else if (reason === null) {
      form.clearErrors("root");
    }
  }, [form, navigate, location, reason]);

  useEffect(() => {
    if (!auth.user) return;

    // TODO: je toto userfriendly?
    if (location.state?.from) {
      navigate(location.state.from.pathname);
      return;
    }

    if (auth.user.roles.includes("ROLE_ADMIN")) {
      navigate("/admin");
    } else {
      navigate("/app");
    }
  }, [auth.user, navigate, location]);

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
            <>
              <Alert
                variant={reason === "unauthenticated" ? "info" : "destructive"}
              >
                <AlertCircleIcon />
                <AlertDescription>
                  {form.formState.errors.root.message}
                </AlertDescription>
              </Alert>
            </>
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
                  <Input
                    type="email"
                    autoComplete="email"
                    autoFocus
                    {...field}
                  />
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
