import { useForm } from "react-hook-form";
// import { useParams } from "react-router";

const EditUser = () => {
  //   const { userID } = useParams();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm();

  //   console.log(userID);

  const arr = ["USER", "ADMIN"];

  return (
    <div>
      <form className="bg-white p-8 max-w-md mx-auto rounded-xl shadow-md space-y-6">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Upravit uživatele {/* EMail*/}
        </h2>
        <div className="flex flex-col gap-1">
          <label className="font-medium">Role</label>
          {arr.map((role) => (
            <div key={role} className="flex items-center">
              <input
                type="checkbox"
                {...register("roles")}
                className="form-checkbox"
              />
              <label className="ml-2">{role}</label>
            </div>
          ))}
          {errors.fullname && (
            <span className="text-red-500 text-sm">
              {errors.fullname.message as string}
            </span>
          )}
        </div>
        <button type="submit" className="btn-lime w-full">
          Uložit
        </button>
      </form>
    </div>
  );
};

export default EditUser;
