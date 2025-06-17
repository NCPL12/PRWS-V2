"use client"

import type * as React from "react"
import { ChevronLeft, Command, Download, LayoutDashboard, Scroll, StickyNote } from "lucide-react"
import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import { TeamSwitcher } from "./team-switcher"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, useSidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

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
    },
  ],
  navMain: [
    {
      title: "Templates",
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
    },
  ],
}

// Custom sidebar toggle button positioned in the middle of the right edge
function SidebarToggle() {
  const { toggleSidebar, state } = useSidebar()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute right-0 top-1/2 z-20 h-6 w-6 -translate-y-1/2 translate-x-1/2 rounded-full bg-white shadow-md border border-gray-200 hover:bg-gray-50 hover:shadow-lg transition-all duration-200"
      onClick={toggleSidebar}
    >
      <ChevronLeft
        className={`h-3 w-3 text-gray-600 transition-transform ${state === "collapsed" ? "rotate-180" : ""}`}
      />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" className="relative" {...props}>
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

      <SidebarToggle />
    </Sidebar>
  )
}
