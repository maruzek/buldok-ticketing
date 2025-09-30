import { FieldValues, useForm } from "react-hook-form";
import useApi from "../../hooks/useApi";
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";

const CreateEntrance = () => {
  const form = useForm();
  const { fetchData } = useApi();
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { mutate, isPending: isSaving } = useMutation({
    mutationFn: (data: FieldValues) =>
      fetchData("/admin/entrances/create", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (res, variables) => {
      toast.success(`Vstup ${variables.name} byl úspěšně vytvořen!`);
      queryClient.invalidateQueries({ queryKey: ["entrances"] });
      navigate("/admin/entrances");
    },
    onError: (error: any) => {
      console.error("Error creating entrance:", error);
      toast.error(
        error?.message ||
          "Nastala chyba při vytváření vstupu. Zkuste to prosím znovu."
      );
    },
  });

  return (
    <Card className="w-full lg:max-w-1/3 mx-auto">
      <CardHeader>
        <CardTitle>Vytvořit vstup</CardTitle>
      </CardHeader>
      <CardContent>
        {form.formState.errors.root && (
          <div className="form-error-box">
            {form.formState.errors.root.message}
          </div>
        )}
        <Form {...form}>
          <form
            className="w-full flex flex-col gap-4"
            onSubmit={form.handleSubmit((data) => mutate(data))}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Název</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lokace (odkaz na mapy)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
            <Button type="submit" disabled={isSaving}>
              Vytvořit
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CreateEntrance;
