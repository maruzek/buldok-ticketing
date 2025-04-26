import React from "react";
import { Link } from "react-router";

const LoginIndexPage = () => {
  const handleLoginSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    console.log("submit");
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
          <form className="space-y-6" onSubmit={handleLoginSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Email
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Heslo
                </label>
                <div className="text-sm">
                  <a
                    href="#"
                    className="font-semibold text-lime-700 hover:text-lime-600"
                  >
                    Zapomenuté heslo
                  </a>
                </div>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <button type="submit" className="btn-lime w-full mb-3">
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
