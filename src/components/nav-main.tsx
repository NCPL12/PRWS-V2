"use client"

import type { LucideIcon } from "lucide-react"
import { usePathname } from "next/navigation"

import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    icon?: LucideIcon
    isExpandable?: boolean
    url?: string
    isActive?: boolean
  }[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      {/* <SidebarGroupLabel>Platform</SidebarGroupLabel> */}
      <SidebarMenu>
        {items.map((item) => {
          const isActive = item.isActive || pathname === item.url

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                className={
                  isActive
                    ? "bg-[#E8EFFD] text-[#2966E9] hover:bg-[#E8EFFD] hover:text-[#2966E9] data-[active=true]:bg-[#E8EFFD] data-[active=true]:text-[#2966E9]"
                    : ""
                }
                isActive={isActive}
              >
                <a href={item.url}>
                  {item.icon && <item.icon className={isActive ? "text-[#2966E9]" : ""} />}
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
