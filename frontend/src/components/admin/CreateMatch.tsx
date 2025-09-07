import { useForm, FieldValues } from "react-hook-form";
import { cs } from "date-fns/locale/cs";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router";
import useApi from "../../hooks/useApi";
import { Match } from "../../types/Match";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Textarea } from "../ui/textarea";

const CreateMatch = () => {
  // const {
  //   register,
  //   handleSubmit,
  //   control,
  //   formState: { errors },
  // } = useForm();
  const form = useForm({
    defaultValues: {
      rival: "",
      matchDate: undefined,
      matchTime: "10:30:00",
      description: "",
    },
  });
  const { fetchData } = useApi();

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: (data: FieldValues) => {
      console.log("form data", data);
      const dateTime = new Date(data.matchDate);
      const [hours, minutes, seconds] = data.matchTime.split(":").map(Number);
      dateTime.setHours(hours, minutes, seconds);

      data.matchDate = dateTime;
      return fetchData<Match>("/admin/match/create", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (result, variables) => {
      toast.success(`Zápas proti ${variables.rival} byl úspěšně vytvořen!`);
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      navigate("/admin/matches");
    },
    onError: (error: any) => {
      console.error("Error creating match:", error);
      toast.error(
        error?.message ||
          "Nastala chyba při vytváření zápasu. Zkuste to prosím znovu."
      );
    },
  });

  return (
    // <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md ">
    //   {errors.root && (
    //     <div className="form-error-box">{errors.root.message as string}</div>
    //   )}
    //   <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
    //     <h2 className="text-2xl font-bold mb-4 text-center">Vytvořit zápas</h2>
    //     <div className="flex flex-col gap-1">
    //       <label className="font-medium">Soupeř</label>
    //       <input
    //         type="text"
    //         {...register("rival", { required: "Toto pole je povinné" })}
    //         className="form-input"
    //       />
    //       {errors.rival && (
    //         <span className="text-red-500 text-sm">
    //           {errors.rival.message as string}
    //         </span>
    //       )}
    //     </div>
    //     <div className="flex flex-col gap-1">
    //       <label className="font-medium">Datum zápasu</label>
    //       <Controller
    //         control={control}
    //         name="matchDate"
    //         rules={{ required: "Toto pole je povinné" }}
    //         render={({ field }) => (
    //           <DatePicker
    //             {...field}
    //             selected={field.value}
    //             onChange={field.onChange}
    //             dateFormat="dd.MM.yyyy HH:mm"
    //             showTimeSelect
    //             timeIntervals={5}
    //             locale="cs"
    //             className="form-input"
    //             name="matchDate"
    //             required
    //           />
    //         )}
    //       />
    //       {errors.matchDate && (
    //         <span className="text-red-500 text-sm">
    //           {errors.matchDate.message as string}
    //         </span>
    //       )}
    //     </div>

    //     <div className="flex flex-col gap-1">
    //       <label className="font-medium">Popis</label>
    //       <textarea
    //         {...register("description")}
    //         className="form-input resize-y min-h-[80px]"
    //       />
    //       {errors.description && (
    //         <span className="text-red-500 text-sm">
    //           {errors.description.message as string}
    //         </span>
    //       )}
    //     </div>

    //     <button
    //       type="submit"
    //       className={`${isPending ? "btn-disabled" : "btn-lime"} w-full`}
    //     >
    //       Vytvořit zápas
    //     </button>
    //   </form>
    // </div>
    <Card className="w-full lg:max-w-3/5 mx-auto min-h-3/5">
      <CardHeader>
        <CardTitle>Vytvořit nový zápas</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="w-full flex flex-col gap-4"
            onSubmit={form.handleSubmit((data) => mutate(data))}
          >
            <FormField
              control={form.control}
              name="rival"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Soupeř</FormLabel>
                  <FormControl>
                    <Input placeholder="Soupeř" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="w-full flex flex-row gap-4">
              <FormField
                control={form.control}
                name="matchDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Termín zápasu</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal bg-white",
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
                          disabled={(date) => date <= new Date()}
                          captionLayout="dropdown"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col justify-end">
                <FormField
                  control={form.control}
                  name="matchTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Čas zápasu</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          step="1"
                          className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Poznámka</FormLabel>
                  <FormControl>
                    <Textarea className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              className={`${
                isSubmitting ? "btn-disabled cursor-progress" : ""
              } w-full`}
            >
              Vytvořit
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CreateMatch;
