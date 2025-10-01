import * as React from "react";
import { NavLink } from "react-router";
import {
  GalleryVerticalEnd,
  LayoutDashboard,
  Logs,
  Users,
  Ticket,
  DoorOpen,
  Plus,
  ChevronRight,
  Calendar,
  Swords,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";

const data = {
  user: {
    name: "Admin",
    email: "admin@example.com",
    avatar: "/logo-buldok-transparent.png",
  },
  teams: [
    {
      name: "Buldok Ticketing",
      logo: GalleryVerticalEnd,
      plan: "Admin",
    },
  ],
  navMain: [
    {
      title: "Přehled",
      url: "/admin",
      icon: LayoutDashboard,
      isActive: false,
    },
    {
      title: "Zápasy",
      url: "#",
      icon: Logs,
      items: [
        {
          title: "Vytvořit zápas",
          url: "/admin/matches/create",
        },
        {
          title: "Seznam zápasů",
          url: "/admin/matches",
        },
      ],
    },
    {
      title: "Uživatelé",
      url: "/admin/users",
      icon: Users,
    },
    {
      title: "Ceny",
      url: "/admin/tickets",
      icon: Ticket,
    },
    {
      title: "Vstupy",
      url: "#",
      icon: DoorOpen,
      items: [
        {
          title: "Spravovat vstupy",
          url: "/admin/entrances",
        },
        {
          title: "Vytvořit vstup",
          url: "/admin/entrances/create",
        },
      ],
    },
  ],
  projects: [],
};
// TODO: make child components reusable and unified
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="icon"
      variant="inset"
      className="overflow-hidden"
      {...props}
    >
      <SidebarHeader>
        {/* <TeamSwitcher teams={data.teams} /> */}
        {/* TODO: Season switcher */}
        <h1>Buldok</h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="hover:bg-muted data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
              >
                <NavLink to="/admin" end>
                  <LayoutDashboard className="" />
                  Přehled
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          {/* <SidebarGroupLabel className="text-sidebar-foreground/70 text-sm pt-4 pb-0 px-4 mb-1">
            Zápasy
          </SidebarGroupLabel> */}
          <SidebarMenu>
            <Collapsible
              asChild
              defaultOpen={true}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                    <Swords />
                    <span>Zápasy</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <NavLink to="/admin/matches/create" end>
                          <Plus className="" />
                          Vytvořit
                        </NavLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <NavLink to="/admin/matches" end>
                          <Logs className="" />
                          Seznam
                        </NavLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroup>
        {/* Seasons */}
        <SidebarGroup>
          <SidebarMenu>
            <Collapsible
              asChild
              defaultOpen={false}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                    <Calendar />
                    <span>Sezóny</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <NavLink to="/admin/seasons/create" end>
                          <Plus className="" />
                          Vytvořit
                        </NavLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <NavLink to="/admin/seasons" end>
                          <Logs className="" />
                          Seznam
                        </NavLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          {/* <SidebarGroupLabel className="text-sidebar-foreground/70 text-sm pt-4 pb-0 px-4 mb-1">
            Uživatelé
          </SidebarGroupLabel> */}
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
              >
                <NavLink to="/admin/users" end>
                  <Users className="" />
                  Uživatelé
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          {/* <SidebarGroupLabel className="text-sidebar-foreground/70 text-sm pt-4 pb-0 px-4 mb-1">
            Ceny
          </SidebarGroupLabel> */}
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
              >
                <NavLink to="/admin/tickets" end>
                  <Ticket className="" />
                  Vstupenky
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          {/* <SidebarGroupLabel className="text-sidebar-foreground/70 text-sm pt-4 pb-0 px-4 mb-1">
            Vstupy
          </SidebarGroupLabel> */}
          <SidebarMenu>
            <Collapsible
              asChild
              defaultOpen={false}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ">
                    <DoorOpen className="" />
                    <span>Vstupy</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <NavLink to="/admin/entrances" end>
                          <DoorOpen className="" />
                          Spravovat
                        </NavLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <NavLink to="/admin/entrances/create">
                          <Plus className="" />
                          Vytvořit
                        </NavLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
