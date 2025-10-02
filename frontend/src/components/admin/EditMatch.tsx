import { useForm, FieldValues } from "react-hook-form";
import { cs } from "date-fns/locale/cs";
import { useNavigate, useParams } from "react-router";
import useApi from "../../hooks/useApi";
import { Match } from "../../types/Match";
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
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "../ui/textarea";
import { ApiError } from "@/types/ApiError";
import MatchError from "../errors/MatchError";

const EditMatch = () => {
  const { matchID } = useParams<{ matchID: string }>();
  const navigate = useNavigate();
  const { fetchData } = useApi();

  const {
    data: editedMatch,
    isPending,
    isError,
    error,
  } = useQuery<Match, ApiError>({
    queryKey: ["match", matchID],
    queryFn: () => fetchData<Match>(`/match/${matchID}`, { method: "GET" }),
    retry: false,
  });

  const form = useForm({
    values: {
      rival: editedMatch ? editedMatch.rival : "",
      matchDate: editedMatch ? new Date(editedMatch.playedAt) : undefined,
      matchTime: editedMatch
        ? new Date(editedMatch.playedAt).toTimeString().split(" ")[0]
        : "10:30:00",
      description: editedMatch ? editedMatch.description : "",
      status: editedMatch && editedMatch.status,
    },
  });

  // useEffect(() => {
  //   if (editedMatch) {
  //     form.reset({
  //       rival: editedMatch.rival,
  //       matchDate: new Date(editedMatch.playedAt),
  //       description: editedMatch.description,
  //       status: editedMatch.status,
  //     });
  //   }
  // }, [editedMatch, form]);

  const queryClient = useQueryClient();

  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: (data: FieldValues) => {
      console.log(data);
      return fetchData<Match>(`/admin/match/${matchID}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["match", matchID] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      toast.success(`Zápas proti ${variables.rival} byl úspěšně upraven.`);
      navigate("/admin/matches");
    },
    onError: (error: any) => {
      console.error("Error updating match:", error);
      toast.error(
        error?.message ||
          "Nastala chyba při aktualizaci zápasu. Zkuste to prosím znovu."
      );
    },
  });

  if (isPending) {
    return (
      <div className="flex justify-center items-center h-full">
        <h1 className="text-2xl font-bold">
          <Spinner />
        </h1>
      </div>
    );
  }

  if (isError) {
    return <MatchError error={error!} matchID={matchID!} />;
  }

  return (
    <Card className="w-full lg:max-w-1/3 mx-auto">
      <CardHeader>
        <CardTitle>Upravit zápas</CardTitle>
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
                    <Input placeholder="Název soupeře" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="w-full flex flex-row gap-4 flex-wrap">
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
                          disabled={(date) => date <= new Date()}
                          captionLayout="dropdown"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Vyberte stav zápasu" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Aktivní</SelectItem>
                      <SelectItem value="finished">Odehrán</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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
              Uložit změny
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default EditMatch;
