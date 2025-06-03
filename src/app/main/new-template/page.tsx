import RequireAuth from "@/components/RequireAuth"
import { TemplateCreator } from "@/components/template-creator"
import { TemplateList } from "@/components/TemplateList"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"

export default function Home() {
  return (
           <RequireAuth>
    <SidebarInset>
      <header className="flex h-14 items-center border-b px-4 py-8">
        <SidebarTrigger className="mr-2" />
        <h1 className="text-s font-semibold">Dashboard</h1>
      </header>
      <div className="p-4">
<TemplateCreator/>
      </div>
    </SidebarInset>
       </RequireAuth>
  )
}
