import { useState } from "react";
import { NavLink, Outlet } from "react-router";
import {
  CalendarDays,
  DoorOpen,
  LayoutDashboard,
  Logs,
  Plus,
  Ticket,
  Users,
} from "lucide-react";
import useAuth from "../hooks/useAuth";

const Dashboard = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user } = useAuth();

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // TODO active zalozky
  // TODO dynamicky title pomoci useLocation

  return (
    <div className="flex h-screen" id="admin-dashboard">
      {/* Sidebar */}
      <aside
        className="w-64 bg-emerald-950 text-white flex flex-col"
        id="admin-dashboard-aside"
      >
        <div className="p-4 text-xl font-bold h-15">
          <h1 className="text-xl font-bold">Buldok Ticketing</h1>
        </div>
        <div className="p-4 text-sm tracking-widest uppercase">Menu</div>
        <nav className="flex flex-col w-full">
          <div className="sidebar-group w-full flex flex-col">
            <NavLink to="/admin" className="sidebar-group-item" end>
              <LayoutDashboard className="mr-2" />
              Přehled
            </NavLink>
            <NavLink
              to="/admin/current-season"
              className="sidebar-group-item"
              end
            >
              <CalendarDays className="mr-2" />
              Současná sezóna
            </NavLink>
            <hr className="text-green-900 mx-4 my-2 opacity-70" />
          </div>

          <div className="sidebar-group w-full flex flex-col">
            <span className="pt-4 pb-0 px-4 mb-1 text-gray-400 text-sm">
              Zápasy
            </span>
            <NavLink to="/admin/matches/create" className="sidebar-group-item">
              <Plus className="mr-2" />
              Vytvořit zápas
            </NavLink>
            <NavLink to="/admin/matches" className="sidebar-group-item" end>
              <Logs className="mr-3" />
              Seznam zápasů
            </NavLink>
            <hr className="text-green-900 mx-4 my-2 opacity-70" />
          </div>

          <div className="sidebar-group w-full flex flex-col">
            <span className="pt-4 pb-0 px-4 mb-1 text-gray-400 text-sm">
              Uživatelé
            </span>
            <NavLink to="/admin/users" className="sidebar-group-item">
              <Users className="mr-2" />
              Seznam uživatelů
            </NavLink>
          </div>

          <div className="sidebar-group w-full flex flex-col">
            <span className="pt-4 pb-0 px-4 mb-1 text-gray-400 text-sm">
              Ceny
            </span>
            <NavLink to="/admin/tickets" className="sidebar-group-item">
              <Ticket className="mr-2" />
              Upravit ceny vstupenek
            </NavLink>
          </div>

          <div className="sidebar-group w-full flex flex-col">
            <span className="pt-4 pb-0 px-4 mb-1 text-gray-400 text-sm">
              Vstupy
            </span>
            <NavLink to="/admin/entrances" className="sidebar-group-item" end>
              <DoorOpen className="mr-2" />
              Spravovat vstupy
            </NavLink>
            <NavLink
              to="/admin/entrances/create"
              className="sidebar-group-item"
              end
            >
              <Plus className="mr-2" />
              Vytvořit vstup
            </NavLink>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white  p-4 flex justify-between items-center h-15 shadow-xl/30">
          <h1 className="text-xl font-bold">Dashboard</h1>
          <div className="relative">
            <div
              className="w-10 h-10 bg-gray-300 rounded-full cursor-pointer"
              onClick={toggleDropdown}
            ></div>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow">
                <ul>
                  <li className="p-2 hover:bg-green-100 cursor-pointer">
                    Settings
                  </li>
                  <li className="p-2 hover:bg-green-100 cursor-pointer">
                    Sign Out
                  </li>
                </ul>
              </div>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 bg-green-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
