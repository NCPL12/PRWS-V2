import { TemplateList } from "@/components/TemplateList"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { UserDropdown } from "@/components/UserDropdown"
import RequireAuth from "@/components/RequireAuth"

export default function Home() {
  return (
    <RequireAuth>
      <SidebarInset>
        <header className="flex h-14 items-center justify-between border-b px-4 py-8">
          <div className="flex items-center">
            {/* <SidebarTrigger className="mr-2" /> */}
            <h1 className="text-xl font-semibold">Templates</h1>
          </div>
          <UserDropdown />
        </header>
        <div className="p-4">
          <TemplateList />
        </div>
      </SidebarInset>
    </RequireAuth>
  )
}
