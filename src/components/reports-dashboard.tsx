"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Eye, CheckCircle, FileText, Trash2, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import BottomRightLogo from "./BottomRightLogo"

interface Report {
  generatedDate: string | number
  generatedBy: string
  id: number
  name: string
  createdAt: string
  isApproved: boolean
  reviewedBy: string | null
  assignedApprover: string
  assignedReview: string
  status: "pending" | "reviewed" | "approved" | "rejected"
}

type ReportType = "manual" | "daily" | "weekly" | "monthly"
type ActionType = "approve" | "delete" | "review" | null

export default function ReportsDashboard() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedReportType, setSelectedReportType] = useState<ReportType>("manual")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [currentReportId, setCurrentReportId] = useState<number | null>(null)
  const [actionType, setActionType] = useState<ActionType>(null)
  const [dialogMessage, setDialogMessage] = useState("")

  // Mock API base URL - replace with your actual API
  const apiBaseUrl ="http://localhost:8080/bms-reports/v1"

  useEffect(() => {
    loadReports()
  }, [selectedReportType])

  const loadReports = async () => {
    setLoading(true)
    try {
 const endpoint = getApiEndpoint()
const response = await fetch(endpoint)
if (!response.ok) {
  throw new Error(`Failed to fetch reports from ${endpoint}`)
}
const data = await response.json()
console.log(data)
setReports(data)

    } catch (error) {
      console.error(`Error fetching ${selectedReportType} reports:`, error)
      toast({
        title: "Error",
        description: `Failed to load ${selectedReportType} reports`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getApiEndpoint = () => {
    const endpoints = {
      manual: `${apiBaseUrl}/reports`,
      daily: `${apiBaseUrl}/daily-reports`,
      weekly: `${apiBaseUrl}/weekly-reports`,
      monthly: `${apiBaseUrl}/monthly-reports`,
    }
    return endpoints[selectedReportType]
  }

const formatDate = (dateInput: string | number) => {
  try {
    const epochMillis = typeof dateInput === "string" ? parseInt(dateInput, 10) : dateInput
    const date = new Date(Number(epochMillis))
    if (isNaN(date.getTime())) throw new Error("Invalid timestamp")
    return format(date, "dd-MMM-yyyy HH:mm:ss")
  } catch {
    return "Invalid date"
  }
}
  const getStatusBadge = (report: Report) => {
    if (report.isApproved) {
      return (
        <Badge variant="default" className="bg-green-500">
          Approved
        </Badge>
      )
    } else if (report.reviewedBy) {
      return <Badge variant="secondary">Reviewed</Badge>
    } else {
      return <Badge variant="outline">Pending</Badge>
    }
  }

  const viewReport = (reportId: number) => {
    setCurrentReportId(reportId)
    const endpoint = `${getApiEndpoint()}/${reportId}`
    setPdfUrl(endpoint)
    setShowPdfModal(true)
  }

  const closePdf = () => {
    setShowPdfModal(false)
    setPdfUrl(null)
    setCurrentReportId(null)
    loadReports()
  }

  const confirmAction = (reportId: number, action: ActionType) => {
    const currentReport = reports.find((r) => r.id === reportId)
    const username = localStorage.getItem("username") || "current.user"

    if (action === "approve" && currentReport?.assignedApprover !== username) {
      toast({
        title: "Access Denied",
        description: "You are not assigned to approve this report.",
        variant: "destructive",
      })
      return
    }

    if (action === "review" && currentReport?.assignedReview !== username) {
      toast({
        title: "Access Denied",
        description: "You are not assigned to review this report.",
        variant: "destructive",
      })
      return
    }

    setCurrentReportId(reportId)
    setActionType(action)

    const messages = {
      approve: "Are you sure you want to approve this report?",
      review: "Are you sure you want to review this report?",
      delete: "Are you sure you want to delete this report? This action cannot be undone.",
    }

    // setDialogMessage(messages[action] || "")
    setShowConfirmDialog(true)
  }

  const handleConfirm = async (confirmed: boolean) => {
    setShowConfirmDialog(false)

    if (!confirmed || !currentReportId || !actionType) {
      setCurrentReportId(null)
      setActionType(null)
      return
    }

    const currentReport = reports.find((report) => 
        report.id === currentReportId)
    if (!currentReport) {
      toast({
        title: "Error",
        description: "Unable to find the selected report.",
        variant: "destructive",
      })
      return
    }

    try {
      if (actionType === "approve") {
        await approveReport(currentReportId, currentReport.name)
      } else if (actionType === "review") {
        await reviewReport(currentReportId, currentReport.name)
      } else if (actionType === "delete") {
        await deleteReport(currentReportId)
      }
    } catch (error) {
      console.error(`Error performing ${actionType} action:`, error)
      toast({
        title: "Error",
        description: `Failed to ${actionType} report`,
        variant: "destructive",
      })
    }

    setCurrentReportId(null)
    setActionType(null)
  }

  const approveReport = async (reportId: number, reportName: string) => {
    const username = localStorage.getItem("username") || "current.user"

    // Mock API calls - replace with actual implementation
    try {
      // Log approval action
      console.log("Logging approval:", { username, reportType: selectedReportType, reportId, reportName })

      // Update report status
      setReports((prev) =>
        prev.map((report) =>
          report.id === reportId ? { ...report, isApproved: true, status: "approved" as const } : report,
        ),
      )

      toast({
        title: "Success",
        description: `Report "${reportName}" approved successfully`,
      })

      if (showPdfModal) closePdf()
    } catch (error) {
      throw error
    }
  }

  const reviewReport = async (reportId: number, reportName: string) => {
    const username = localStorage.getItem("username") || "current.user"

    try {
      // Log review action
      console.log("Logging review:", { username, reportType: selectedReportType, reportId, reportName })

      // Update report status
      setReports((prev) =>
        prev.map((report) =>
          report.id === reportId ? { ...report, reviewedBy: username, status: "reviewed" as const } : report,
        ),
      )

      toast({
        title: "Success",
        description: `Report "${reportName}" reviewed successfully`,
      })

      if (showPdfModal) closePdf()
    } catch (error) {
      throw error
    }
  }

  const deleteReport = async (reportId: number) => {
    // Mock delete - replace with actual API call
    setReports((prev) => prev.filter((report) => report.id !== reportId))

    toast({
      title: "Success",
      description: "Report deleted successfully",
    })
  }

  const canApprove = (report: Report) => {
    const username = localStorage.getItem("username") || "current.user"
    return !report.isApproved && report.assignedApprover === username
  }

  const canReview = (report: Report) => {
    const username = localStorage.getItem("username") || "current.user"
    return !report.reviewedBy && report.assignedReview === username
  }

  return (
    <div className="container mx-auto p-3  space-y-6">
      <Card>
        <CardHeader>
          {/* <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Reports Dashboard
          </CardTitle> */}
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-9">
            <div className="flex items-center gap-2">
              <label htmlFor="report-type" className="text-sm font-medium">
                Report Type:
              </label>
              <Select value={selectedReportType} onValueChange={(value: ReportType) => setSelectedReportType(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  {/* <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem> */}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={loadReports} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading reports...</span>
            </div>
          ) : (
         <div className="rounded-md border overflow-y-auto" style={{ maxHeight: "450px" }}>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>ID</TableHead>
        <TableHead>Name</TableHead>
        <TableHead>Created At</TableHead>
        <TableHead>Generated by</TableHead>
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {reports.length === 0 ? (
        <TableRow>
          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
            No reports found
          </TableCell>
        </TableRow>
      ) : (
        reports.map((report) => (
          <TableRow key={report.id}>
            <TableCell className="font-medium">{report.id}</TableCell>
            <TableCell>{report.name}</TableCell>
            <TableCell>{formatDate(report.generatedDate)}</TableCell>
            <TableCell>{report.generatedBy || "-"}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => viewReport(report.id)}>
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                {/* {canReview(report) && (
                  <Button variant="outline" size="sm" onClick={() => confirmAction(report.id, "review")}>
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Review
                  </Button>
                )} */}
                {/* {canApprove(report) && (
                  <Button variant="outline" size="sm" onClick={() => confirmAction(report.id, "approve")}>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                )} */}
              </div>
            </TableCell>
          </TableRow>
        ))
      )}
    </TableBody>
  </Table>
</div>

          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>{dialogMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleConfirm(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleConfirm(true)}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PDF Modal */}
      <Dialog open={showPdfModal} onOpenChange={setShowPdfModal}>
 <DialogContent className="max-w-5xl h-[90vh] flex flex-col">

          <DialogHeader>
            <DialogTitle>Report Viewer</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden rounded border">
  {pdfUrl ? (
    <iframe
      src={pdfUrl}
      className="w-full h-full min-h-[500px]"
      title="Report PDF"
      frameBorder="0"
    />
  ) : (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      Failed to load PDF
    </div>
  )}
</div>

          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              {currentReportId && (
                <>
                  {canReview(reports.find((r) => r.id === currentReportId)!) && (
                    <Button variant="outline" onClick={() => confirmAction(currentReportId, "review")}>
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                  )}
                  {canApprove(reports.find((r) => r.id === currentReportId)!) && (
                    <Button onClick={() => confirmAction(currentReportId, "approve")}>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                  )}
                </>
              )}
            </div>
            <Button variant="outline" onClick={closePdf}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
                     <BottomRightLogo />
    </div>
  )
}
