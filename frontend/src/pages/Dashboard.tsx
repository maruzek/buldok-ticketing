import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router";
import {
  CalendarDays,
  DoorOpen,
  LayoutDashboard,
  Logs,
  Plus,
  Ticket,
  Users,
} from "lucide-react";
import Header from "../components/app/Header";

const getTitleFromPathname = (pathname: string): string => {
  switch (pathname) {
    case "/admin":
      return "Přehled";
    case "/admin/current-season":
      return "Současná sezóna";
    case "/admin/matches/create":
      return "Vytvořit zápas";
    case "/admin/matches":
      return "Seznam zápasů";
    case "/admin/users":
      return "Seznam uživatelů";
    case "/admin/tickets":
      return "Ceny vstupenek";
    case "/admin/entrances":
      return "Správa vstupů";
    case "/admin/entrances/create":
      return "Vytvořit vstup";
    default:
      if (pathname.startsWith("/admin/matches/")) return "Detail zápasu";
      return "Dashboard";
  }
};

const Dashboard = () => {
  const [headerTitle, setHeaderTitle] = useState("Dashboard");
  const location = useLocation();

  useEffect(() => {
    document.title = `${getTitleFromPathname(
      location.pathname
    )} | Buldok Ticketing`;
    setHeaderTitle(getTitleFromPathname(location.pathname));
  }, [location.pathname]);

  // TODO active zalozky
  // TODO dynamicky title pomoci useLocation

  return (
    <div className="flex h-screen bg-green-50" id="admin-dashboard">
      {/* Sidebar */}
      <aside
        className="w-64 bg-emerald-950 text-white flex flex-col sticky top-0 h-screen overflow-y-auto"
        id="admin-dashboard-aside"
      >
        <div className="p-4 text-xl font-bold h-15">
          <h1 className="text-xl font-bold">Buldok Ticketing</h1>
        </div>
        <div className="p-4 text-sm tracking-widest uppercase">Menu</div>
        <nav className="flex flex-col w-full flex-1 overflow-y-auto">
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
      <div className="flex-1 flex flex-col h-screen overflow-y-scroll">
        {/* Header */}

        <Header>
          <h1 className="text-xl font-bold">{headerTitle}</h1>
        </Header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 ">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
