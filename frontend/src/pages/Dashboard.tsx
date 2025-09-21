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

  return (
    <SidebarProvider defaultOpen={true}>
      <div
        className="flex h-screen w-screen text-foreground"
        id="admin-dashboard"
      >
        {/* Sidebar */}
        {/* <Sidebar
          variant="sidebar"
          className="bg-sidebar border-r border-sidebar-border"
        >
          <SidebarHeader className="p-4">
            <h1 className="text-xl font-bold text-sidebar-foreground">
              Buldok Ticketing
            </h1>
          </SidebarHeader>

          <SidebarContent>
            <div className="p-4 text-sm tracking-widest uppercase text-sidebar-foreground/70">
              Menu
            </div>

            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground transition-colors"
                    >
                      <NavLink to="/admin" end>
                        <LayoutDashboard className="mr-2" />
                        Přehled
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-sidebar-foreground/70 text-sm pt-4 pb-0 px-4 mb-1">
                Zápasy
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
                    >
                      <NavLink to="/admin/matches/create">
                        <Plus className="mr-2" />
                        Vytvořit zápas
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
                    >
                      <NavLink to="/admin/matches" end>
                        <Logs className="mr-3" />
                        Seznam zápasů
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-sidebar-foreground/70 text-sm pt-4 pb-0 px-4 mb-1">
                Uživatelé
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
                    >
                      <NavLink to="/admin/users">
                        <Users className="mr-2" />
                        Seznam uživatelů
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-sidebar-foreground/70 text-sm pt-4 pb-0 px-4 mb-1">
                Ceny
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
                    >
                      <NavLink to="/admin/tickets">
                        <Ticket className="mr-2" />
                        Upravit ceny vstupenek
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-sidebar-foreground/70 text-sm pt-4 pb-0 px-4 mb-1">
                Vstupy
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
                    >
                      <NavLink to="/admin/entrances" end>
                        <DoorOpen className="mr-2" />
                        Spravovat vstupy
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
                    >
                      <NavLink to="/admin/entrances/create" end>
                        <Plus className="mr-2" />
                        Vytvořit vstup
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar> */}

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
