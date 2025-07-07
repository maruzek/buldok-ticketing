import { User } from "lucide-react";
import useAuth from "../hooks/useAuth";
import { useState } from "react";

type HeaderProps = {
  children?: React.ReactNode;
  color?: string;
  onToggleSidebar?: () => void;
};

const Header = ({ children, color }: HeaderProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { logout } = useAuth();

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  return (
    <header
      className={`p-4 flex justify-between items-center h-15 shadow-md ${
        color && color.trim() !== "" ? color : "bg-white"
      }`}
    >
      <div className="flex items-center w-full justify-between">
        <div className="flex items-center">
          {children ? (
            <div className="flex items-center">{children}</div>
          ) : (
            <img
              src="/logo-buldok-transparent.png"
              alt="Logo"
              className="h-10 w-auto"
            />
          )}
        </div>
        <div className="relative">
          <div
            className="w-10 h-10 flex justify-center items-center cursor-pointer"
            onClick={toggleDropdown}
          >
            <User className="w-full h-full m-0 p-0 bg-gray-300 rounded-full text-gray-600 hover:bg-gray-400 transition-colors" />
            {isDropdownOpen && (
              <div className="absolute right-0 top-12 w-48 bg-white border rounded shadow z-50">
                <ul>
                  <li className="p-2 hover:bg-green-100 cursor-pointer">
                    Settings
                  </li>
                  <li
                    className="p-2 hover:bg-green-100 cursor-pointer"
                    onClick={() => {
                      logout();
                    }}
                  >
                    Sign Out
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
