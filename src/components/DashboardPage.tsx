"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import { CheckCircle, Clock, TrendingUp, FileText, Calendar, BarChart3 } from "lucide-react"

interface Report {
  id: string
  title: string
  isApproved: boolean
  createdAt: string
  type: string
}

interface DashboardStats {
  approvedCount: number
  pendingCount: number
  totalCount: number
  approvedPercentage: number
}

const COLORS = {
  approved: "hsl(var(--chart-1))",
  pending: "hsl(var(--chart-2))",
  primary: "hsl(var(--primary))",
  secondary: "hsl(var(--secondary))",
}

export default function DashboardPage() {
  const [selectedReportType, setSelectedReportType] = useState<string>("manual")
  const [stats, setStats] = useState<DashboardStats>({
    approvedCount: 0,
    pendingCount: 0,
    totalCount: 0,
    approvedPercentage: 0,
  })
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Mock API base URL - replace with your actual environment variable
  const apiBaseUrl = "http://localhost:8080/bms-reports/v1"

  const loadReports = async () => {
    setLoading(true)
    setError(null)

    try {
      let apiUrl = ""
      switch (selectedReportType) {
        case "manual":
          apiUrl = `${apiBaseUrl}/reports`
          break
        case "daily":
          apiUrl = `${apiBaseUrl}/daily-reports`
          break
        case "weekly":
          apiUrl = `${apiBaseUrl}/weekly-reports`
          break
        case "monthly":
          apiUrl = `${apiBaseUrl}/monthly-reports`
          break
        default:
          throw new Error("Invalid report type selected")
      }



      // Uncomment this for actual API call:
      const response = await fetch(apiUrl)
      if (!response.ok) throw new Error('Failed to fetch reports')
      const data = await response.json()

    //   const data = mockData
      setReports(data)
      calculateStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("Error fetching reports:", err)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (reports: Report[]) => {
    const approvedCount = reports.filter((report) => report.isApproved).length
    const pendingCount = reports.length - approvedCount
    const totalCount = reports.length
    const approvedPercentage = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0

    setStats({
      approvedCount,
      pendingCount,
      totalCount,
      approvedPercentage,
    })
  }

  useEffect(() => {
    loadReports()
  }, [selectedReportType])

  const pieChartData = [
    { name: "Approved", value: stats.approvedCount, color: COLORS.approved },
    { name: "Pending", value: stats.pendingCount, color: COLORS.pending },
  ]

  const barChartData = [
    { name: "Manual", approved: 12, pending: 3 },
    { name: "Daily", approved: 8, pending: 2 },
    { name: "Weekly", approved: 15, pending: 1 },
    { name: "Monthly", approved: 6, pending: 4 },
  ]

  const trendData = [
    { month: "Jan", reports: 20 },
    { month: "Feb", reports: 25 },
    { month: "Mar", reports: 18 },
    { month: "Apr", reports: 32 },
    { month: "May", reports: 28 },
    { month: "Jun", reports: 35 },
  ]

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Monitor your reports and track approval status</p>
        </div>

        <Select value={selectedReportType} onValueChange={setSelectedReportType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select report type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Manual Reports
              </div>
            </SelectItem>
            <SelectItem value="daily">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Daily Reports
              </div>
            </SelectItem>
            <SelectItem value="weekly">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Weekly Reports
              </div>
            </SelectItem>
            <SelectItem value="monthly">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Monthly Reports
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalCount}</div>
                <p className="text-xs text-muted-foreground">{selectedReportType} reports</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">{stats.approvedCount}</div>
                <p className="text-xs text-muted-foreground">{stats.approvedPercentage}% approval rate</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-orange-600">{stats.pendingCount}</div>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.approvedPercentage}%</div>
                <p className="text-xs text-muted-foreground">Overall approval rate</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Approval Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Approval Status</CardTitle>
            <CardDescription>Distribution of approved vs pending reports</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ChartContainer
                config={{
                  approved: {
                    label: "Approved",
                    color: COLORS.approved,
                  },
                  pending: {
                    label: "Pending",
                    color: COLORS.pending,
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Report Types Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Reports by Type</CardTitle>
            <CardDescription>Comparison across different report types</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                approved: {
                  label: "Approved",
                  color: COLORS.approved,
                },
                pending: {
                  label: "Pending",
                  color: COLORS.pending,
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="approved" fill={COLORS.approved} />
                  <Bar dataKey="pending" fill={COLORS.pending} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Report Trends</CardTitle>
          <CardDescription>Monthly report submission trends</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              reports: {
                label: "Reports",
                color: COLORS.primary,
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="reports"
                  stroke={COLORS.primary}
                  strokeWidth={2}
                  dot={{ fill: COLORS.primary }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Latest {selectedReportType} reports</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {reports.slice(0, 5).map((report) => (
                <div key={report.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{report.title}</p>
                    <p className="text-sm text-muted-foreground">{report.createdAt}</p>
                  </div>
                  <Badge variant={report.isApproved ? "default" : "secondary"}>
                    {report.isApproved ? "Approved" : "Pending"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
