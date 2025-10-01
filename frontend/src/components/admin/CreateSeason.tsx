import ContentBoard from "./ContentBoard";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { FieldValues, useForm } from "react-hook-form";
import { Calendar } from "../ui/calendar";
import { Button } from "../ui/button";
import { format } from "date-fns";
import { cs } from "date-fns/locale/cs";
import { cn } from "@/lib/utils";
import useApi from "@/hooks/useApi";
import { useNavigate } from "react-router";

const CreateSeason = () => {
  const { fetchData } = useApi();
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      years:
        new Date().getFullYear().toString() +
        "/" +
        (new Date().getFullYear() + 1).toString(),
      startAt: new Date(),
      endAt: new Date(),
    },
  });

  const queryClient = useQueryClient();

  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: (data: FieldValues) => {
      console.log("form data", data);
      const [yearStart, yearEnd] = data.years
        .split("/")
        .map((y: string) => parseInt(y, 10));
      if (yearEnd !== yearStart + 1) {
        form.setError("years", {
          type: "manual",
          message: "Rok musí být ve formátu RRRR/RRRR, např. 2023/2024.",
        });
        throw new Error("Rok musí být ve formátu RRRR/RRRR, např. 2023/2024.");
      }
      if (data.startAt >= data.endAt) {
        form.setError("endAt", {
          type: "manual",
          message: "Konec sezóny musí být po jejím začátku.",
        });
        throw new Error("Konec sezóny musí být po jejím začátku.");
      }
      return fetchData("/season/", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seasons"] });
      toast.success("Sezóna byla úspěšně vytvořena!");
      form.reset();
      navigate("/admin/seasons");
    },
    onError: (error: any) => {
      console.error("Error creating season:", error);
      toast.error("Nastala chyba při vytváření sezóny.");
    },
  });

  return (
    <ContentBoard>
      <Card className="w-full lg:max-w-1/3 mx-auto">
        <CardHeader>
          <CardTitle>Vytvořit sezónu</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              className="w-full flex flex-col gap-4"
              onSubmit={form.handleSubmit((data) => mutate(data))}
            >
              <FormField
                control={form.control}
                name="years"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ročník sezóny</FormLabel>
                    <FormDescription>
                      Ročník musí být ve formátu RRRR/RRRR, např. 2025/2026.
                    </FormDescription>
                    <FormControl>
                      <Input
                        placeholder="2023/2024"
                        {...field}
                        required
                        pattern="^\d{4}\/\d{4}$"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="w-full flex flex-row gap-4 flex-wrap">
                <FormField
                  control={form.control}
                  name="startAt"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Začátek sezóny</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal bg-white",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: cs })
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            startMonth={
                              new Date(new Date().getFullYear() - 5, 0, 1)
                            }
                            endMonth={
                              new Date(new Date().getFullYear() + 5, 11, 31)
                            }
                            captionLayout="dropdown"
                            required
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endAt"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Konec sezóny</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal bg-white",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: cs })
                              ) : (
                                <span>Vyberte datum</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            captionLayout="dropdown"
                            startMonth={
                              new Date(new Date().getFullYear() - 5, 0, 1)
                            }
                            endMonth={
                              new Date(new Date().getFullYear() + 5, 11, 31)
                            }
                            required
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="w-full flex justify-end mt-4">
                <Button disabled={isSubmitting} type="submit">
                  Vytvořit sezónu
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </ContentBoard>
  );
};

export default CreateSeason;
