import { FieldValues, useForm } from "react-hook-form";
import useApi from "../../hooks/useApi";
import { EditStatus } from "../../types/EditStatus";
import { useNavigate } from "react-router";

type CreateEntranceProps = {
  onEntranceCreate: (status: EditStatus) => void;
};

const CreateEntrance = ({ onEntranceCreate }: CreateEntranceProps) => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm();
  const { fetchData } = useApi();
  const navigate = useNavigate();

  const onSubmit = async (data: FieldValues) => {
    try {
      const res = await fetchData("/admin/entrances/create", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res) {
        setError("root", {
          type: "server",
          message:
            "Nastala chyba při vytváření vstupu, zkuste to prosím znovu později.",
        });
        throw new Error("Failed to create entrance");
      }

      onEntranceCreate({
        status: "ok",
        message: `Vstup ${data.name} byl úspěšně vytvořen.`,
      });
      navigate("/admin/entrances");
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
