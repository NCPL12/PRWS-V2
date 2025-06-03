import DashboardPage from "@/components/DashboardPage"
import ReportsDashboard from "@/components/reports-dashboard"
import RequireAuth from "@/components/RequireAuth"
import { TemplateCreator } from "@/components/template-creator"
import { TemplateList } from "@/components/TemplateList"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { FileText } from "lucide-react"

export default function Home() {
  return (
      <RequireAuth>
   <SidebarInset>
      <header className="flex h-14 items-center border-b px-6 py-8">
        <SidebarTrigger className="mr-2" />
        <h1 className="text-s font-semibold flex ">Trends
  </h1>
      </header>
      <div className="p-4">
        <DashboardPage/>
      </div>
    </SidebarInset>
       </RequireAuth>
  )
}
