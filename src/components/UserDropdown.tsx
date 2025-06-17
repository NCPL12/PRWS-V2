"use client"

import { useEffect, useState } from "react"
import { LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"

interface UserProps {
  name: string
  role: string
  avatar?: string
}

export function UserDropdown() {
  const router = useRouter()
  const [user, setUser] = useState<UserProps>({
    name: "",
    role: "",
    avatar: "/assets/avatar.png",
  })

  useEffect(() => {
    const name = localStorage.getItem("username") || "User"
    const role = localStorage.getItem("role") || "Viewer"
    const avatar = localStorage.getItem("avatar") || "/assets/avatar.png"
    setUser({ name, role, avatar })
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    router.push("/")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="usercolor" className="relative h-8 w-8 rounded-full p-0">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback className="text-white font-semibold" style={{ backgroundColor: "#777F8A" }}>
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none"> Name: {user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">Role: {user.role}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
