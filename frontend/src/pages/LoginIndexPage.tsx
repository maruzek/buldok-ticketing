import { Link, useNavigate, useSearchParams } from "react-router";
import { FieldValues, useForm } from "react-hook-form";
import useAuth from "../hooks/useAuth";
import { useEffect, useState } from "react";
import useApi from "../hooks/useApi";
import { User } from "../types/User";

const LoginIndexPage = () => {
  const { login, auth } = useAuth();
  const navigate = useNavigate();
  const { fetchData, error: apiError } = useApi();
  const [searchParams, setSearchParams] = useSearchParams();
  const [paramMessage, setParamMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    const reason = searchParams.get("reason");
    if (reason === "unauthenticated") {
      setParamMessage("Byli jste odhlášeni. Přihlašte se prosím znovu.");
    } else if (reason === null) {
      setParamMessage(null);
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    console.log("apiError: ", apiError);
    if (auth.user) {
      if (auth.user.roles.includes("ROLE_ADMIN")) {
        navigate("/admin");
      } else {
        navigate("/app");
      }
    }
  }, [auth.user, navigate, apiError]);

  const onSubmit = async (data: FieldValues) => {
    setSearchParams({});

    try {
      const responseData = await fetchData<{ user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (responseData?.user === null) {
        setError("root", {
          type: "server",
          message:
            "Nesprávné uživatelské jméno nebo heslo, nebo vašemu účtu chybí ověření od správce.",
        });
        return;
      }
      clearErrors("root");
      login(responseData.user);
      if (responseData.user.roles.includes("ROLE_ADMIN")) {
        navigate("/admin");
      } else {
        navigate("/app");
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            alt="Your Company"
            src="./logo-buldok-transparent.png"
            className="mx-auto h-50 w-auto"
          />
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
            Přihlášení do ticketingu
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          {errors.root && (
            <div className="form-error-box">
              <h3 className="text-sm font-medium text-red-800">
                {errors.root.message}
              </h3>
            </div>
          )}

          {apiError && (
            <div className="form-error-box">
              <h3 className="text-sm font-medium text-red-800">{apiError}</h3>
            </div>
          )}
          {paramMessage && (
            <div className="form-error-box">
              <h3 className="text-sm font-medium text-red-800">
                {paramMessage}
              </h3>
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="text-sm/6">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register("email", { required: true })}
                autoComplete="email"
                className="form-input"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm/6">
                  Heslo
                </label>
                <a
                  href="#"
                  className="text-sm font-semibold text-lime-700 hover:text-lime-600"
                >
                  Zapomenuté heslo
                </a>
              </div>

              <input
                id="password"
                type="password"
                {...register("password", { required: true })}
                autoComplete="password"
                className="form-input"
              />
            </div>

            <div>
              <button
                type="submit"
                className={`${
                  isSubmitting ? "btn-disabled" : "btn-lime"
                } w-full`}
              >
                Sign in
              </button>
            </div>
          </form>
          <Link
            to="/register"
            className="font-semibold text-lime-700 hover:text-lime-600 text-center text-sm/6"
          >
            Registrace
          </Link>
        </div>
      </div>
    </>
  );
};

export default LoginIndexPage;
