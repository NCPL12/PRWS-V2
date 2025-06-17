"use client"

import { BadgeCheck, Bell, ChevronsUpDown, CreditCard, LogOut, Sparkles } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"

export function NavUser() {
  const { isMobile, state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center gap-2 px-4 py-2 group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:justify-center">
          <img
            src="/assets/logo.png"
            alt="Company Logo"
            className={`shrink-0 ${isCollapsed ? "h-5 w-5" : "h-6 w-6"}`}
          />
          <span className="text-sm font-semibold truncate group-data-[collapsible=icon]:hidden">
            Neptune Controls Pvt Ltd
          </span>
        </div>

      </SidebarMenuItem>
    </SidebarMenu>
  )
}
