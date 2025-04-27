import { useForm, Controller, FieldValues } from "react-hook-form";
import DatePicker, { registerLocale } from "react-datepicker";
import cs from "date-fns/locale/cs";
import "react-datepicker/dist/react-datepicker.css";
import { useEffect } from "react";
import { MatchEditStatus } from "../../types/MatchEditStatus";
import { useNavigate } from "react-router";

registerLocale("cs", cs);

type CreateMatchProps = {
  onCreateMatch: (status: MatchEditStatus) => void;
};

const CreateMatch = ({ onCreateMatch }: CreateMatchProps) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setError,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm();
  // const [entrances, setEntrances] = useState<any[]>([]);

  useEffect(() => {
    // Fetch Users for entrances
  }, [watch]);

  const navigate = useNavigate();

  const onSubmit = async (data: FieldValues) => {
    try {
      const res = await fetch("http://localhost:8080/api/match/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error creating match:", errorData);
        setError("root", {
          type: "manual",
          message: errorData.message || "Chyba při vytváření zápasu",
        });
        return;
      }

      const resData = await res.json();
      onCreateMatch({
        status: "ok",
        message: `Zápas proti ${data.rival} úspěšně vytvořen`,
        matchId: resData.matchId,
      });
      navigate("/admin/matches");
      console.log(resData);
    } catch (error) {
      console.error("Error creating match:", error);
    }
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
        {/* TODO: prirazeni vstupu jednotlivym lidem */}

        <div className="flex flex-col gap-1">{}</div>

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
          className={`${isSubmitting ? "btn-disabled" : "btn-lime"} w-full`}
        >
          Vytvořit zápas
        </button>
      </form>
    </div>
  );
};

export default CreateMatch;
