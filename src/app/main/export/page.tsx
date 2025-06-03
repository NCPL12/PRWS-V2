
import ExportReportComponent from "@/components/export-report"
import RequireAuth from "@/components/RequireAuth"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"

export default function Home() {
  return (
  <RequireAuth>
      <SidebarInset>
      <header className="flex h-14 items-center border-b px-4 py-8">
        <SidebarTrigger className="mr-2" />
        <h1 className="text-s font-semibold">Export Reports</h1>
      </header>
      <div className="p-4">
<ExportReportComponent />
      </div>
    </SidebarInset>
   </RequireAuth>
  )
}
