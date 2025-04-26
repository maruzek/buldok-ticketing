import { useForm, Controller } from "react-hook-form";
import DatePicker, { registerLocale } from "react-datepicker";
import cs from "date-fns/locale/cs";
import "react-datepicker/dist/react-datepicker.css";

registerLocale("cs", cs);

const CreateMatch = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm();

  // Example seasons, replace with dynamic data if needed
  const seasons = [
    { value: "2024", label: "2024" },
    { value: "2025", label: "2025" },
  ];

  const onSubmit = async (data: any) => {
    // Format date to DD.MM.YYYY for submission

    // console.log(data);
    try {
      const res = await fetch("http://localhost:8080/api/match/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      console.log(resData);
    } catch (error) {
      console.error("Error creating match:", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md space-y-6"
    >
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
      <div className="flex flex-col gap-1">
        <label className="font-medium">Popis</label>
        <textarea
          {...register("description", { required: "Toto pole je povinné" })}
          className="form-input resize-y min-h-[80px]"
        />
        {errors.description && (
          <span className="text-red-500 text-sm">
            {errors.description.message as string}
          </span>
        )}
      </div>
      <button type="submit" className="w-full btn-lime">
        Vytvořit zápas
      </button>
    </form>
  );
};

export default CreateMatch;
