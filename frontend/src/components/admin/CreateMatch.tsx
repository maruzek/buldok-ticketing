import { useForm, Controller, FieldValues } from "react-hook-form";
import DatePicker, { registerLocale } from "react-datepicker";
import { cs } from "date-fns/locale/cs";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router";
import useApi from "../../hooks/useApi";
import { Match } from "../../types/Match";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

registerLocale("cs", cs);

const CreateMatch = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  const { fetchData } = useApi();

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FieldValues) =>
      fetchData<Match>("/admin/match/create", {
        method: "POST",
        body: JSON.stringify(data),
      }),
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

  const onSubmit = async (data: FieldValues) => {
    mutate(data);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md ">
      {errors.root && (
        <div className="form-error-box">{errors.root.message as string}</div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Vytvořit zápas</h2>
        <div className="flex flex-col gap-1">
          <label className="font-medium">Soupeř</label>
          <input
            type="text"
            {...register("rival", { required: "Toto pole je povinné" })}
            className="form-input"
          />
          {errors.rival && (
            <span className="text-red-500 text-sm">
              {errors.rival.message as string}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-medium">Datum zápasu</label>
          <Controller
            control={control}
            name="matchDate"
            rules={{ required: "Toto pole je povinné" }}
            render={({ field }) => (
              <DatePicker
                {...field}
                selected={field.value}
                onChange={field.onChange}
                dateFormat="dd.MM.yyyy HH:mm"
                showTimeSelect
                timeIntervals={5}
                locale="cs"
                className="form-input"
                name="matchDate"
                required
              />
            )}
          />
          {errors.matchDate && (
            <span className="text-red-500 text-sm">
              {errors.matchDate.message as string}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-medium">Popis</label>
          <textarea
            {...register("description")}
            className="form-input resize-y min-h-[80px]"
          />
          {errors.description && (
            <span className="text-red-500 text-sm">
              {errors.description.message as string}
            </span>
          )}
        </div>

        <button
          type="submit"
          className={`${isPending ? "btn-disabled" : "btn-lime"} w-full`}
        >
          Vytvořit zápas
        </button>
      </form>
    </div>
  );
};

export default CreateMatch;
