import { useMutation } from "@tanstack/react-query";
import Header from "../components/Header";
import { FieldValues, useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useApi from "@/hooks/useApi";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router";

const Register = () => {
  const form = useForm();
  const { fetchData } = useApi();
  const navigate = useNavigate();

  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: (data: FieldValues) =>
      fetchData("/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }),
    onError: (error: any) => {
      if (error.status === 422) {
        toast.error("Vámi zadané údaje nejsou platné.");
        form.setError("root", {
          type: "server",
          message:
            "Vámi zadaný email je již používán. Je možné, že spráce zatím váš účet nepotvrdil.",
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

  return (
    <div>
      <Header />
      <main className="p-4 w-full md:max-w-3/5 lg:max-w-1/3 mx-auto">
        <h1 className="font-bold text-xl my-3 text-center">
          Registrace do ticketing systému
        </h1>
        {form.formState.errors.root?.type === "server" && (
          <>
            <Alert variant="destructive">
              <AlertCircle />
              <AlertTitle>Nastala chyba</AlertTitle>
              <AlertDescription>
                {form.formState.errors.root.message as string}
              </AlertDescription>
            </Alert>
          </>
        )}
        <Form {...form}>
          <form
            className="flex flex-col gap-2 w-full mt-3"
            onSubmit={form.handleSubmit((data) => mutate(data))}
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex flex-col mb-4 w-full">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="vas@email.cz" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem className="flex flex-col mb-4 w-full">
                  <FormLabel>Celé jméno</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Jan Novák" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="flex flex-col mb-4 w-full">
                  <FormLabel>Heslo</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Vaše heslo"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="flex flex-col mb-4 w-full">
                  <FormLabel>Potvrzení hesla</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Heslo znovu"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-auto self-end"
            >
              Registrovat se
            </Button>
          </form>
        </Form>
      </main>
    </div>
  );
};

export default Register;
