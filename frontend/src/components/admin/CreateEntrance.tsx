import { FieldValues, useForm } from "react-hook-form";

const CreateEntrance = () => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm();

  const onSubmit = async (data: FieldValues) => {
    try {
      const res = await fetch(
        "http://localhost:8080/api/admin/entrance/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!res.ok) {
        setError("root", {
          type: "server",
          message:
            "Nastala chyba při vytváření vstupu, zkuste to prosím znovu později.",
        });
        console.log(await res.json());
        throw new Error("Failed to create entrance");
      }

      const resData = await res.json();
      console.log(resData);
    } catch (error) {
      console.error("Error creating entrance:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Vytvořit vstup</h2>
      {isSubmitSuccessful && (
        <div className="bg-green-100 text-green-700 p-4 mb-4 rounded-md">
          Vstup byl úspěšně vytvořen!
        </div>
      )}
      {errors.root && (
        <div className="bg-red-100 text-red-700 p-4 mb-4 rounded-md">
          {errors.root.message as string}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto space-y-6">
        <div className="flex flex-col gap-1">
          <label className="font-medium">Název</label>
          <input
            type="text"
            {...register("name", { required: "Toto pole je povinné" })}
            className="form-input"
          />
          {errors.name && (
            <span className="text-red-500 text-sm">
              {errors.name.message as string}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-medium">Lokace (odkaz na mapy)</label>
          <input {...register("location")} className="form-input" />
          {errors.location && (
            <span className="text-red-500 text-sm">
              {errors.location.message as string}
            </span>
          )}
        </div>
        <button
          type="submit"
          className={`${
            isSubmitting ? "btn-disabled w-full" : "btn-lime w-full"
          }`}
        >
          Vytvořit zápas
        </button>
      </form>
    </div>
  );
};

export default CreateEntrance;
