import { Cog, LayoutDashboard, LogOut, User, Volleyball } from "lucide-react";
import useAuth from "../hooks/useAuth";
import { Link } from "react-router";
import logo from "../assets/logo-buldok-transparent.png";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type HeaderProps = {
  children?: React.ReactNode;
  color?: string;
  onToggleSidebar?: () => void;
};

const Header = ({ children, color }: HeaderProps) => {
  const { logout, auth } = useAuth();
  const isAdmin = auth.user?.roles.includes("ROLE_ADMIN");

  return (
    <header
      className={`p-4 flex justify-between items-center h-15 border-b ${
        color && color.trim() !== "" ? color : "bg-background"
      }`}
    >
      <div className="flex items-center w-full justify-between">
        <div className="flex items-center">
          {children ? (
            <div className="flex items-center">{children}</div>
          ) : (
            <Link to="/app">
              <img src={logo} alt="Logo" className="h-10 w-auto" />
            </Link>
          )}
        </div>
        <div className="relative">
          {auth.user && (
            <DropdownMenu>
              <DropdownMenuTrigger className="w-10 h-10 flex justify-center items-center cursor-pointer">
                <User className="w-full h-full m-0 p-0 bg-gray-300 rounded-full text-gray-600 hover:bg-gray-400 transition-colors" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Cog />
                  Nastavení
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <Link to="/admin">
                      <DropdownMenuItem>
                        <LayoutDashboard />
                        Admin
                      </DropdownMenuItem>
                    </Link>
                    <Link to="/app">
                      <DropdownMenuItem>
                        <Volleyball />
                        Aplikace
                      </DropdownMenuItem>
                    </Link>
                  </>
                )}
                <DropdownMenuItem onClick={logout}>
                  <LogOut /> Odhlásit se
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
