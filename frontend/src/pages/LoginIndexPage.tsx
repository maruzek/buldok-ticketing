import React from "react";
import { Link } from "react-router";
import { FieldValues, useForm } from "react-hook-form";
import useAuth from "../hooks/useAuth";

const LoginIndexPage = () => {
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm();

  const onSubmit = async (data: FieldValues) => {
    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (res.status === 401) {
        setError("root", {
          type: "server",
          message: "Nesprávné uživatelské jméno nebo heslo.",
        });
        return;
      }

      if (!res.ok) {
        setError("root", {
          type: "server",
          message:
            "Nastala chyba při přihlašování. Zkuste to prosím znovu později, nebo se obraťte na administrátora.",
        });
        return;
      }

      const responseData = await res.json();
      clearErrors("root");
      // login(responseData.refreshToken, responseData.user);
      console.log(responseData);
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
