import DatePicker, { registerLocale } from "react-datepicker";
import { useForm, FieldValues, Controller } from "react-hook-form";
import { cs } from "date-fns/locale/cs";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { EditStatus } from "../../types/EditStatus";
import useApi from "../../hooks/useApi";
import { Match } from "../../types/Match";
import Spinner from "../Spinner";

registerLocale("cs", cs);

type EditMatchProps = {
  onEditMatch: (status: EditStatus) => void;
};

const EditMatch = ({ onEditMatch }: EditMatchProps) => {
  const [isLoading, setIsLoading] = useState(false);
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
  const { fetchData } = useApi();

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        setIsLoading(true);
        const data = await fetchData<Match>(`/match/${matchID}`, {
          method: "GET",
        });
        console.log(data);
        setValue("rival", data.rival);
        setValue("matchDate", new Date(data.playedAt));
        setValue("description", data.description);
        setValue("status", data.status);
      } catch (error) {
        console.error("Error fetching match:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMatch();
  }, [matchID, setValue, setError, fetchData]);

  const onSubmit = async (data: FieldValues) => {
    try {
      const res = await fetchData<Match>(`/admin/match/${matchID}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });

      onEditMatch({
        status: "ok",
        message: `Zápas proti ${res.rival} úspěšně upraven`,
      });
      navigate("/admin/matches");
    } catch (error) {
      console.error("Error creating entrance:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <h1 className="text-2xl font-bold">
          <Spinner />
        </h1>
      </div>
    );
  }

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
