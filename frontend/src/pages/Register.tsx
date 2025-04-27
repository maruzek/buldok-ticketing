import Header from "../components/app/Header";
import { FieldValues, useForm } from "react-hook-form";

const Register = () => {
  const {
    register,
    handleSubmit,
    getValues,
    setError,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm();

  const onSubmit = async (data: FieldValues) => {
    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        setError("root", {
          type: "server",
          message:
            "Nastala chyba při registraci, zkuste to prosím znovu později.",
        });
        throw new Error("Chyba při registraci");
      }

      const result = await response.json();
      console.log(result);
    } catch (error) {
      setError("root", {
        type: "server",
        message:
          "Nastala chyba při registraci, zkuste to prosím znovu později.",
      });
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <Header />
      <main className="p-4">
        <h1 className="font-bold text-xl mb-3">
          Registrace do ticketing systému
        </h1>
        {errors.root?.type === "server" && (
          <div className="bg-red-100 text-red-700 p-4 mb-4 rounded-md">
            {errors.root.message as string}
          </div>
        )}
        {isSubmitSuccessful && (
          <div className="bg-green-100 text-green-700 p-4 mb-4 rounded-md">
            Registrace proběhla úspěšně! Nyní vám bude potvren váš účet
            správcem.
          </div>
        )}
        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit((data) => onSubmit(data))}
        >
          {/* Registration Form with useForm */}
          <div className="">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              {...register("email", { required: "Email je povinný" })}
              className="form-input"
            />
            {errors.email && (
              <span className="text-red-500 text-sm">
                {errors.email.message as string}
              </span>
            )}
          </div>
          <div className="">
            <label htmlFor="fullName">Celé jméno</label>
            <input
              type="text"
              id="fullName"
              {...register("fullName", {
                required: "Jméno je povinné",
                validate: (value) =>
                  value.trim().split(" ").length > 1 || "Zadejte celé jméno",
                minLength: {
                  value: 5,
                  message: "Jméno musí mít alespoň 5 znaků",
                },
              })}
              className="form-input"
            />
            {errors.fullName && (
              <span className="text-red-500 text-sm">
                {errors.fullName.message as string}
              </span>
            )}
          </div>
          <div className="">
            <label htmlFor="password">Heslo</label>
            <input
              type="password"
              id="password"
              {...register("password", {
                required: "Heslo je povinné",
                minLength: {
                  value: 10,
                  message: "Heslo musí mít alespoň 10 znaků",
                },
              })}
              className="form-input"
            />
            {errors.password && (
              <span className="text-red-500 text-sm">
                {errors.password.message as string}
              </span>
            )}
          </div>
          <div className="">
            <label htmlFor="confirmPassword">Potvrzení hesla</label>
            <input
              type="password"
              id="confirmPassword"
              {...register("confirmPassword", {
                required: "Potvrzení hesla je povinné",
                validate: (value) =>
                  value === getValues("password") || "Hesla se neshodují",
              })}
              className="form-input"
            />
            {errors.confirmPassword && (
              <span className="text-red-500 text-sm">
                {errors.confirmPassword.message as string}
              </span>
            )}
          </div>
          <button
            type="submit"
            className={isSubmitting ? "bg-gray-500" : "btn-lime"}
          >
            Registrovat se
          </button>
        </form>
      </main>
    </div>
  );
};

export default Register;
