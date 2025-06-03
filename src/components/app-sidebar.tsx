"use client"

import type * as React from "react"
import { AudioWaveform, Command, Download, GalleryVerticalEnd, LayoutDashboard, Scroll, StickyNote } from "lucide-react"

import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import { TeamSwitcher } from "./team-switcher"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  teams: [
    {
      name: "Reporting Manager",
     logo: Command,
      plan: "Client Company Name",
    }
  ],
  navMain: [
    {
      title: "List",
      icon: Scroll,
      isExpandable: true,
      url: "/main/dashboard",
    },
    {
      title: "Reports",
      icon: StickyNote,
      isExpandable: true,
      url: "/main/reports",
    },
    {
      title: "Export",
      icon: Download,
      isExpandable: true,
      url: "/main/export",
    },
     {
      title: "Trends",
      icon: LayoutDashboard,
      isExpandable: true,
      url: "/main/trend",
    }
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
