import { TemplateList } from "@/components/TemplateList"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import RequireAuth from "@/components/RequireAuth";


export default function Home() {
  return (
      <RequireAuth>
    <SidebarInset>
      <header className="flex h-14 items-center border-b px-4 py-8">
        <SidebarTrigger className="mr-2" />
        <h1 className="text-s font-semibold">Template Management
</h1>
      </header>
      <div className="p-4">
       <TemplateList/>
      </div>
    </SidebarInset>
    </RequireAuth>
  )
}
