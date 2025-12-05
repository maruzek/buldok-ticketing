import { useMutation } from "@tanstack/react-query";
import Header from "../components/Header";
import { FieldValues, useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { FormMessageList } from "@/components/ui/form-message-list";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useApi from "@/hooks/useApi";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import { applyValidationErrors } from "@/lib/validationErrors";
import { PasswordStrengthIndicator } from "@/components/ui/password-strength";
import { usePasswordStrength } from "@/hooks/usePasswordStrength";
import { cn } from "@/lib/utils";

type RegisterFormData = {
  email: string;
  fullName: string;
  password: string;
  confirmPassword: string;
};

const Register = () => {
  const form = useForm<RegisterFormData>({
    defaultValues: {
      email: "",
      fullName: "",
      password: "",
      confirmPassword: "",
    },
  });
  const { fetchData } = useApi();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const passwordValue = form.watch("password");
  const confirmPasswordValue = form.watch("confirmPassword");
  const passwordStrength = usePasswordStrength(passwordValue || "");

  const passwordsMatch =
    passwordValue === confirmPasswordValue && confirmPasswordValue !== "";

  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: (data: FieldValues) =>
      fetchData("/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }),
    onError: (error: unknown) => {
      const hasFieldErrors = applyValidationErrors(form, error);

      if (hasFieldErrors) {
        toast.error("Opravte prosím chyby ve formuláři.");
      } else if ((error as any)?.status === 422) {
        toast.error("Vámi zadané údaje nejsou platné.");
        form.setError("root", {
          type: "server",
          message:
            "Vámi zadaný email je již používán. Je možné, že správce zatím váš účet nepotvrdil.",
        });
      } else {
        toast.error("Nastala chyba při registraci.");
        form.setError("root", {
          type: "server",
          message:
            "Nastala chyba při registraci, zkuste to prosím znovu později.",
        });
      }
    },
    onSuccess: () => {
      toast.success(
        "Registrace proběhla úspěšně! Nyní bude potvrzen váš účet správcem."
      );
      form.reset();
      navigate("/");
    },
  });

  const onSubmit = (data: FieldValues) => {
    if (!passwordStrength.isValid) {
      form.setError("password", {
        type: "manual",
        message: "Heslo není dostatečně silné.",
      });
      return;
    }
    mutate(data);
  };

  const canSubmit = passwordStrength.isValid && passwordsMatch && !isSubmitting;

  return (
    <div>
      <Header />
      <main className="p-4 w-full md:max-w-3/5 lg:max-w-1/3 mx-auto">
        <h1 className="font-bold text-xl my-3 text-center">
          Registrace do ticketing systému
        </h1>

        {form.formState.errors.root?.type === "server" && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Nastala chyba</AlertTitle>
            <AlertDescription>
              {form.formState.errors.root.message as string}
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form
            className="flex flex-col gap-2 w-full mt-3"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="email"
              rules={{
                required: "Email je povinný údaj.",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Zadejte platnou emailovou adresu.",
                },
              }}
              render={({ field }) => (
                <FormItem className="flex flex-col mb-4 w-full">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="vas@email.cz" {...field} />
                  </FormControl>
                  <FormMessageList />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fullName"
              rules={{
                required: "Celé jméno je povinný údaj.",
                minLength: {
                  value: 2,
                  message: "Jméno musí mít alespoň 2 znaky.",
                },
              }}
              render={({ field }) => (
                <FormItem className="flex flex-col mb-4 w-full">
                  <FormLabel>Celé jméno</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Jan Novák" {...field} />
                  </FormControl>
                  <FormMessageList />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              rules={{
                required: "Heslo je povinný údaj.",
                minLength: {
                  value: 8,
                  message: "Heslo musí mít alespoň 8 znaků.",
                },
              }}
              render={({ field }) => (
                <FormItem className="flex flex-col mb-4 w-full">
                  <FormLabel>Heslo</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Vaše heslo"
                        {...field}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessageList />

                  {passwordValue && (
                    <PasswordStrengthIndicator strength={passwordStrength} />
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              rules={{
                required: "Potvrzení hesla je povinné.",
                validate: (value) =>
                  value === form.getValues("password") || "Hesla se neshodují.",
              }}
              render={({ field }) => (
                <FormItem className="flex flex-col mb-4 w-full">
                  <FormLabel>Potvrzení hesla</FormLabel>
                  <FormControl>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Heslo znovu"
                      {...field}
                    />
                  </FormControl>
                  <FormMessageList />
                  {confirmPasswordValue && (
                    <p
                      className={cn(
                        "text-sm mt-1",
                        passwordsMatch ? "text-green-600" : "text-red-600"
                      )}
                    >
                      {passwordsMatch
                        ? "✓ Hesla se shodují"
                        : "✗ Hesla se neshodují"}
                    </p>
                  )}
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={!canSubmit}
              className="w-auto self-end"
            >
              {isSubmitting ? "Registruji..." : "Registrovat se"}
            </Button>
          </form>
        </Form>
      </main>
    </div>
  );
};

export default Register;
