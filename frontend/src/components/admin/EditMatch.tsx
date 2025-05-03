import DatePicker, { registerLocale } from "react-datepicker";
import { useForm, FieldValues, Controller } from "react-hook-form";
import { cs } from "date-fns/locale/cs";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { EditStatus } from "../../types/EditStatus";

registerLocale("cs", cs);

type EditMatchProps = {
  onEditMatch: (status: EditStatus) => void;
};

const EditMatch = ({ onEditMatch }: EditMatchProps) => {
  const {
    register,
    handleSubmit,
    setError,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  const { matchID } = useParams<{ matchID: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/match/${matchID}`
        );
        if (!response.ok) {
          setError("root", {
            type: "server",
            message: "Nastala chyba při načítání zápasu.",
          });
          throw new Error("Failed to fetch match");
        }
        const data = await response.json();
        // setEditedMatch(data);
        setValue("rival", data.rival);
        setValue("matchDate", new Date(data.playedAt.date));
        setValue("description", data.description);
      } catch (error) {
        console.error("Error fetching match:", error);
      }
    };
    fetchMatch();
  }, [matchID, setValue, setError]);

  const onSubmit = async (data: FieldValues) => {
    try {
      const res = await fetch(`http://localhost:8080/api/match/${matchID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        setError("root", {
          type: "server",
          message:
            "Nastala chyba při aktualizaci zápasu, zkuste to prosím znovu později.",
        });
        console.log(await res.json());
        throw new Error("Failed to create entrance");
      }

      onEditMatch({
        status: "ok",
        message: `Zápas proti ${data.rival} úspěšně upraven`,
      });
      navigate("/admin/matches");
    } catch (error) {
      console.error("Error creating entrance:", error);
    }
  };

  return (
    <div className="form-page-card">
      <h2 className="text-2xl font-bold text-center">Upravit zápas</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
          <label htmlFor="">Stav</label>
          <select
            {...register("status")}
            className="form-input"
            name="status"
            id="status"
          >
            <option value="Otevřený">Aktivní</option>
            <option value="Ukončený">Zápas odehrán</option>
          </select>
          {errors.status && (
            <span className="text-red-500 text-sm">
              {errors.status.message as string}
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
          className={`${isSubmitting ? "btn-disabled" : "btn-lime"} w-full`}
        >
          Upravit zápas
        </button>
      </form>
    </div>
  );
};

export default EditMatch;
