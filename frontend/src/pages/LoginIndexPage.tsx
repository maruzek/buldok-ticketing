import { LoginForm } from "@/components/login-form";
import logo from "../assets/logo-buldok-transparent.png";
import loginImage from "../assets/login-image.jpg";

const LoginIndexPage = () => {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex size-9 items-center justify-center">
              <img src={logo} alt="Buldok logo" />
            </div>
            Buldok ticketing
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src={loginImage}
          alt="Hráč Buldoků s číslem 10 na drese"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
};

export default LoginIndexPage;
