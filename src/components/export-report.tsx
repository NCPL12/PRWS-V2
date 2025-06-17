"use client";

import { useState, useEffect } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Alert, AlertDescription
} from "@/components/ui/alert";
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from "@/components/ui/tabs";
import {
  Calendar, Clock, Download, FileText, Settings, Users, AlertCircle, CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import BottomRightLogo from "./BottomRightLogo";

interface TemplateData {
  id: number;
  name: string;
  report_group: string;
  additionalInfo: string;
  parameters: string[];
}

interface User {
  id: number;
  username: string;
  role: string;
}

export default function ExportReportComponent() {
  const [reports, setReports] = useState<TemplateData[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [scheduledReportIds, setScheduledReportIds] = useState<number[]>([]);
  const [weeklyScheduledReportIds, setWeeklyScheduledReportIds] = useState<number[]>([]);
  const [monthlyScheduledReportIds, setMonthlyScheduledReportIds] = useState<number[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [exportType, setExportType] = useState("manual");
  const [scheduleFrequency, setScheduleFrequency] = useState("");
  const [predefinedReport, setPredefinedReport] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [assignedApprover, setAssignedApprover] = useState("");
  const [isApproverRequired, setIsApproverRequired] = useState(false);
  const [dailyTime, setDailyTime] = useState<number | null>(null);
  const [weeklyDay, setWeeklyDay] = useState("");
  const [weeklyTime, setWeeklyTime] = useState<number | null>(null);
  const [monthlyDay, setMonthlyDay] = useState<number | null>(null);
  const [monthlyTime, setMonthlyTime] = useState<number | null>(null);
  const [dateError, setDateError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

  const apiBaseUrl = "http://localhost:8080/bms-reports/v1";

  useEffect(() => {
    fetch(`${apiBaseUrl}/templates`)
      .then((res) => res.json())
      .then(setReports)
      .catch((err) => {
        console.error("Failed to fetch templates", err);
        toast.error("Failed to load templates");
      });

    fetch(`${apiBaseUrl}/users`)
      .then((res) => res.json())
      .then(setUsers)
      .catch((err) => {
        console.error("Failed to fetch users", err);
        toast.error("Failed to load users");
      });

    fetch(`${apiBaseUrl}/get-all-daily-scheduled-reports`)
      .then((res) => res.json())
      .then(setScheduledReportIds)
      .catch((err) => console.error("Error fetching scheduled reports", err));

    fetch(`${apiBaseUrl}/get-all-weekly-scheduled-reports`)
      .then((res) => res.json())
      .then(setWeeklyScheduledReportIds)
      .catch((err) => console.error("Error fetching weekly scheduled reports", err));

    fetch(`${apiBaseUrl}/get-all-monthly-scheduled-reports`)
      .then((res) => res.json())
      .then(setMonthlyScheduledReportIds)
      .catch((err) => console.error("Error fetching monthly scheduled reports", err));
  }, []);

  useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    if (event.data === 'report-generated') {
      toast.success("Report exported successfully!");
      router.push('/main/reports');
    }
  };

  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, []);

  const validateDateRange = () => {
    setDateError("");
    if (exportType === "manual" && fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      if (to <= from) {
        setDateError("To Date must be after From Date.");
        return false;
      }
    }
    return true;
  };
function formatDateForJava(date: string): string {
  const d = new Date(date);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy} 00:00`; // append time if required
}

  const handlePredefinedReportChange = (value: string) => {
    setPredefinedReport(value);
    const now = new Date();

    if (value === "yesterday") {
      const y = new Date();
      y.setDate(now.getDate() - 1);
      setFromDate(y.toISOString().split("T")[0]);
      setToDate(y.toISOString().split("T")[0]);
    } else if (value === "oneWeek") {
      const w = new Date();
      w.setDate(now.getDate() - 7);
      setFromDate(w.toISOString().split("T")[0]);
      setToDate(now.toISOString().split("T")[0]);
    } else if (value === "oneMonth") {
      const m = new Date();
      m.setMonth(now.getMonth() - 1);
      setFromDate(m.toISOString().split("T")[0]);
      setToDate(now.toISOString().split("T")[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedTemplate) return toast.error("Please select a template.");
    if (!validateDateRange()) return;
    if (isApproverRequired && !assignedApprover)
      return toast.error("Please assign an approver.");
    if (isApproverRequired && assignedTo === assignedApprover)
      return toast.error("Approver and reviewer cannot be the same person.");

    setIsLoading(true);

    try {
      if (exportType === "manual") await exportReport();
      else if (exportType === "schedule") {
        if (!assignedTo) return toast.error("Please assign a reviewer.");
        await scheduleReport();
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
const exportReport = async () => {
  if (!selectedTemplate || !fromDate || !toDate) {
    toast.error("Please fill in all fields.");
    return;
  }

  const username = localStorage.getItem("username");
  if (!username) {
    toast.error("User not logged in.");
    return;
  }

//   const formattedFrom = `${fromDate}T00:00`;
//   const formattedTo = `${toDate}T23:59`;

const formattedFrom = formatDateForJava(fromDate);
const formattedTo = formatDateForJava(toDate);

const approver = isApproverRequired ? assignedApprover : "";

  // Log the report generation
  await fetch(`${apiBaseUrl}/log-generated-report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      reportId: selectedTemplate.id,
      reportName: selectedTemplate.name
    })
  });

  // Open new tab and show loading UI
  const newTab = window.open("", "_blank");
  if (newTab) {
    newTab.document.write(`
      <html>
        <head><title>Generating Report...</title></head>
        <body style="font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;">
          <div style="border:6px solid #f3f3f3;border-top:6px solid #3498db;border-radius:50%;width:40px;height:40px;animation:spin 1s linear infinite;"></div>
          <p>Generating Report...</p>
          <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
        </body>
      </html>
    `);
  }

  // Generate the report and show it
  const url = `${apiBaseUrl}/exportReport?id=${selectedTemplate.id}&fromDate=${formattedFrom}&toDate=${formattedTo}&username=${username}&assignedTo=${assignedTo}&assigned_approver=${approver}`;

  try {
   const response = await fetch(url);
if (!response.ok) throw new Error("Failed to download report");

const blob = await response.blob();
const blobUrl = URL.createObjectURL(blob);

if (newTab) {
  newTab.document.body.innerHTML = `
    <iframe src="${blobUrl}" style="width:100vw;height:100vh;border:none;"></iframe>
    <script>
      setTimeout(() => {
        window.opener.postMessage('report-generated', '*');
        window.close();
      }, 3000); // 3 seconds delay to let the user see the PDF
    </script>
  `;
}


// ✅ Show success toast and redirect
toast.success("Report exported successfully!");

  } catch (error) {
    if (newTab) {
      newTab.document.body.innerHTML = `<p style="color:red;">❌ Failed to generate report.</p>`;
    }
    toast.error("Failed to generate report");
  }
};


  const scheduleReport = async () => {
    await new Promise((res) => setTimeout(res, 1500));
    toast.success(`Report scheduled ${scheduleFrequency} successfully!`);
  };

  const groupedReports = reports.reduce((acc, report) => {
    acc[report.report_group] = acc[report.report_group] || [];
    acc[report.report_group].push(report);
    return acc;
  }, {} as Record<string, TemplateData[]>);


  return (
    <div className="container mx-auto p-6 ">
      {/* <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Export Reports</h1>
        <p className="text-muted-foreground mt-2">
          Generate and schedule reports with customizable parameters and approval workflows.
        </p>
      </div> */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Selection */}
     <Card className="lg:col-span-1">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <FileText className="h-5 w-5" />
      Select Template
    </CardTitle>
    <CardDescription>Choose a report template to export or schedule</CardDescription>
  </CardHeader>

  {/* Add scroll and max-height here */}
  <CardContent className="space-y-4 overflow-y-auto" style={{ maxHeight: '500px' }}>
    {Object.entries(groupedReports).map(([group, templates]) => (
      <div key={group}>
        <h4 className="font-medium text-sm text-muted-foreground mb-2">{group}</h4>
        <div className="space-y-2">
          {templates.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedTemplate?.id === template.id
                  ? "ring-2 ring-primary bg-primary/5"
                  : "hover:bg-muted/50"
              }`}
              onClick={() => setSelectedTemplate(template)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium text-sm">{template.name}</h5>
                    <p className="text-xs text-muted-foreground mt-1">{template.additionalInfo}</p>
                <div className="flex flex-wrap gap-1 mt-2">
  {template.parameters.map((param) => {
    const displayParam = param.replace(/^EMS_NEW_/, "");
    return (
      <Badge key={param} variant="secondary" className="text-xs" style={{ fontSize: '0.6rem' }}>
        {displayParam}
      </Badge>
    );
  })}
</div>
                  </div>
                  {selectedTemplate?.id === template.id && (
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    ))}
  </CardContent>
</Card>


        {/* Configuration */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuration
            </CardTitle>
            <CardDescription>Configure export settings and scheduling options</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={exportType} onValueChange={setExportType} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Manual Export
                </TabsTrigger>
                <TabsTrigger value="schedule" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule Report
                </TabsTrigger>
              </TabsList>

              <TabsContent value="manual" className="space-y-6 mt-6">
                {/* Date Range Selection */}
                <div className="space-y-4">
                  {/* <Label className="text-base font-medium">Date Range</Label>

                  <Select value={predefinedReport} onValueChange={handlePredefinedReportChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select predefined range or set custom dates" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yesterday">Yesterday</SelectItem>
                      <SelectItem value="oneWeek">Last 7 days</SelectItem>
                      <SelectItem value="oneMonth">Last 30 days</SelectItem>
                      <SelectItem value="custom">Custom range</SelectItem>
                    </SelectContent>
                  </Select> */}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fromDate">From Date</Label>
                      <Input id="fromDate" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="toDate">To Date</Label>
                      <Input id="toDate" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                    </div>
                  </div>

                  {dateError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{dateError}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <Separator />

                {/* Assignment Section */}
                <div className="space-y-4">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Assignment & Approval
                  </Label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="assignedTo">Assigned To (Optional)</Label>
                      <Select value={assignedTo} onValueChange={setAssignedTo}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select reviewer" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.username}>
                              {user.username} ({user.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="approver-required"
                          checked={isApproverRequired}
                          onCheckedChange={setIsApproverRequired}
                        />
                        <Label htmlFor="approver-required">Require Approver</Label>
                      </div>
                      {isApproverRequired && (
                        <Select value={assignedApprover} onValueChange={setAssignedApprover}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select approver" />
                          </SelectTrigger>
                          <SelectContent>
                            {users.map((user) => (
                              <SelectItem key={user.id} value={user.username}>
                                {user.username} ({user.role})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="schedule" className="space-y-6 mt-6">
                {/* Schedule Frequency */}
                <div className="space-y-4">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Schedule Frequency
                  </Label>

                  <Select value={scheduleFrequency} onValueChange={setScheduleFrequency}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Schedule Details */}
                  {scheduleFrequency === "daily" && (
                    <div className="space-y-2">
                      <Label htmlFor="dailyTime">Time (24-hour format)</Label>
                      <Select
                        value={dailyTime?.toString() || ""}
                        onValueChange={(value) => setDailyTime(Number.parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => (
                            <SelectItem key={i} value={i.toString()}>
                              {i.toString().padStart(2, "0")}:00
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {scheduleFrequency === "weekly" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="weeklyDay">Day of Week</Label>
                        <Select value={weeklyDay} onValueChange={setWeeklyDay}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select day" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monday">Monday</SelectItem>
                            <SelectItem value="tuesday">Tuesday</SelectItem>
                            <SelectItem value="wednesday">Wednesday</SelectItem>
                            <SelectItem value="thursday">Thursday</SelectItem>
                            <SelectItem value="friday">Friday</SelectItem>
                            <SelectItem value="saturday">Saturday</SelectItem>
                            <SelectItem value="sunday">Sunday</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weeklyTime">Time</Label>
                        <Select
                          value={weeklyTime?.toString() || ""}
                          onValueChange={(value) => setWeeklyTime(Number.parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 24 }, (_, i) => (
                              <SelectItem key={i} value={i.toString()}>
                                {i.toString().padStart(2, "0")}:00
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {scheduleFrequency === "monthly" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="monthlyDay">Day of Month</Label>
                        <Select
                          value={monthlyDay?.toString() || ""}
                          onValueChange={(value) => setMonthlyDay(Number.parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select day" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 31 }, (_, i) => (
                              <SelectItem key={i + 1} value={(i + 1).toString()}>
                                {i + 1}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="monthlyTime">Time</Label>
                        <Select
                          value={monthlyTime?.toString() || ""}
                          onValueChange={(value) => setMonthlyTime(Number.parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 24 }, (_, i) => (
                              <SelectItem key={i} value={i.toString()}>
                                {i.toString().padStart(2, "0")}:00
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Assignment for Scheduled Reports */}
                <div className="space-y-4">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Assignment & Approval
                  </Label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="assignedTo">Assigned To *</Label>
                      <Select value={assignedTo} onValueChange={setAssignedTo}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select reviewer" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.username}>
                              {user.username} ({user.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="approver-required-schedule"
                          checked={isApproverRequired}
                          onCheckedChange={setIsApproverRequired}
                        />
                        <Label htmlFor="approver-required-schedule">Require Approver</Label>
                      </div>
                      {isApproverRequired && (
                        <Select value={assignedApprover} onValueChange={setAssignedApprover}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select approver" />
                          </SelectTrigger>
                          <SelectContent>
                            {users.map((user) => (
                              <SelectItem key={user.id} value={user.username}>
                                {user.username} ({user.role})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
              <Button onClick={handleSubmit} disabled={!selectedTemplate || isLoading} className="min-w-32">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : exportType === "manual" ? (
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export Report
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Schedule Report
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        
      </div>
               {/* <BottomRightLogo /> */}

    </div>
  )
}
