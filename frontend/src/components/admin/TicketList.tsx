import { useEffect } from "react";
import { FieldValues, useForm } from "react-hook-form";
import useApi from "../../hooks/useApi";
import { TicketPrices } from "../../types/TicketPrices";
import Spinner from "../Spinner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Alert, AlertDescription } from "../ui/alert";
import { AlertCircle } from "lucide-react";

const TicketList = () => {
  const { fetchData } = useApi();

  const {
    data: ticketPrices,
    isPending,
    isError: isFetchError,
    error: fetchError,
  } = useQuery({
    queryKey: ["ticket-prices"],
    queryFn: () => fetchData<TicketPrices>("/ticket-prices", { method: "GET" }),
  });

  const form = useForm({
    values: {
      fullTicket: ticketPrices ? ticketPrices.fullTicket.toString() : "",
      halfTicket: ticketPrices ? ticketPrices.halfTicket.toString() : "",
    },
  });

  useEffect(() => {
    if (isFetchError) {
      console.error("Error fetching ticket prices:", fetchError);
      toast.error("Nastala chyba při načítání cen vstupenek.");
      form.setError("root", {
        type: "server",
        message: "Nastala chyba při načítání cen vstupenek.",
      });
    }
  }, [isFetchError, fetchError, form]);

  const fullTicketValue = form.watch("fullTicket");

  useEffect(() => {
    const fullTicketPrice = parseFloat(fullTicketValue);

    if (!isNaN(fullTicketPrice)) {
      form.setValue("halfTicket", (fullTicketPrice / 2).toString());
    } else {
      form.setValue("halfTicket", "");
    }
  }, [fullTicketValue, form]);

  const queryClient = useQueryClient();

  const { mutate, isPending: isSaving } = useMutation({
    mutationFn: (data: FieldValues) =>
      fetchData<{ status: string; message: string }>("/ticket-prices/", {
        method: "PUT",
        body: JSON.stringify({
          fullTicket: data.fullTicket,
          halfTicket: data.halfTicket,
        }),
      }),
    onSuccess: (response) => {
      if (response.status == "ok") {
        queryClient.invalidateQueries({ queryKey: ["ticket-prices"] });
        toast.success("Ceny vstupenek byly úspěšně aktualizovány.");
      }
    },
    onError: (error: any) => {
      console.error("Error updating ticket prices:", error);
      form.setError("root", {
        type: "server",
        message: "Nastala chyba při aktualizaci cen vstupenek.",
      });
      toast.error(
        error?.message ||
          "Nastala chyba při aktualizaci cen vstupenek. Zkuste to prosím znovu."
      );
    },
  });

  if (isPending) {
    return (
      <div className="form-page-card flex justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <Card className="w-full lg:max-w-1/3 mx-auto">
      <CardHeader>
        <CardTitle>Upravit ceny vstupenek</CardTitle>
      </CardHeader>
      <CardContent>
        {form.formState.errors.root && (
          <Alert variant={"destructive"}>
            <AlertCircle />
            <AlertDescription>
              {form.formState.errors.root.message}
            </AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form
            className="w-full flex flex-col gap-4"
            onSubmit={form.handleSubmit((data) => mutate(data))}
          >
            <FormField
              control={form.control}
              name="fullTicket"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plné vstupenky</FormLabel>
                  <FormControl>
                    <Input placeholder="Cena" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="halfTicket"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Poloviční vstupenky</FormLabel>
                  <FormControl>
                    <Input placeholder="Cena" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSaving}>
              Uložit
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default TicketList;
