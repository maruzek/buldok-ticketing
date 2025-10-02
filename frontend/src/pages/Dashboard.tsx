import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router";
import Header from "../components/Header";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../components/ui/sidebar";
import { AppSidebar } from "../components/app-sidebar";
import { Separator } from "@/components/ui/separator";

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
    case "/admin/seasons":
      return "Seznam sezón";
    case "/admin/seasons/create":
      return "Vytvořit sezónu";
    default:
      if (pathname.startsWith("/admin/matches/")) return "Detail zápasu";
      if (pathname.startsWith("/admin/seasons/")) return "Detail sezóny";
      if (pathname.startsWith("/admin/users/")) return "Detail uživatele";
      if (pathname.startsWith("/admin/tickets/")) return "Detail vstupenky";
      if (pathname.startsWith("/admin/entrances/")) return "Detail vstupu";
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

  return (
    <SidebarProvider defaultOpen={true}>
      <div
        className="flex h-screen w-screen text-foreground"
        id="admin-dashboard"
      >
        <AppSidebar />

        {/* Main Content */}
        <SidebarInset className="flex-1 flex flex-col text-foreground bg-background rounded-md overflow-y-auto">
          {/* Header */}
          <Header onToggleSidebar={() => {}}>
            <SidebarTrigger className="mr-2 cursor-pointer" />
            <Separator
              orientation="vertical"
              className="data-[orientation=vertical]:h-4 mr-4"
            />
            <h1 className="text-xl font-bold">{headerTitle}</h1>
          </Header>

          {/* Main Content Area */}
          <main className="flex-1 p-4">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
