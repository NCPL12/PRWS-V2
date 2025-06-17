import RequireAuth from "@/components/RequireAuth"
import { TemplateCreator } from "@/components/template-creator"
import { TemplateList } from "@/components/TemplateList"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { UserDropdown } from "@/components/UserDropdown"

export default function Home() {
  return (
           <RequireAuth>
    <SidebarInset>
      <header className="flex h-14 items-center justify-between border-b px-4 py-8">
               <div className="flex items-center">
                 {/* <SidebarTrigger className="mr-2" /> */}
                 <h1 className="text-xl font-semibold">Create Template</h1>
               </div>
               <UserDropdown />
             </header>
      <div className="p-4">
<TemplateCreator/>
      </div>
    </SidebarInset>
       </RequireAuth>
  )
}
