"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Save, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TemplatePreview } from "@/components/template-preview"

// Mock API URL - replace with your actual API URL in production
const API_BASE_URL = "http://localhost:8080/bms-reports/v1"

interface ParameterRange {
  min: number
  max: number
  addRange: boolean
  unit: string
  rangeError?: string
  unitError?: string
}

export function TemplateCreator() {
  const router = useRouter()
  const [parameters, setParameters] = useState<string[]>([])
  const [groupNameList, setGroupNameList] = useState<string[]>([])
  const [reportName, setReportName] = useState("")
  const [groupName, setGroupName] = useState("")
  const [selectedParameters, setSelectedParameters] = useState<string[]>([])
  const [parameterRanges, setParameterRanges] = useState<{
    [param: string]: ParameterRange
  }>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [additionalInfo] = useState(["MAX", "AVG", "MIN"])
  const [selectedAdditionalInfo, setSelectedAdditionalInfo] = useState<string[]>([])
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [isAddGroupDialogOpen, setIsAddGroupDialogOpen] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")
  const [addGroupMessage, setAddGroupMessage] = useState("")
  const [activeTab, setActiveTab] = useState("edit")

  // Form validation errors
  const [reportNameError, setReportNameError] = useState("")
  const [groupNameError, setGroupNameError] = useState("")
  const [parametersError, setParametersError] = useState("")
  const [additionalInfoError, setAdditionalInfoError] = useState("")

  // Fetch parameters and group names on component mount
  useEffect(() => {
    fetchParameters()
    fetchGroupNames()
  }, [])

  const fetchParameters = async () => {
    try {
      // In a real app, replace with actual API call
      const response = await fetch(`${API_BASE_URL}/parameters`)
      const data = await response.json()
      setParameters(
        data || [
          "EMS_NEW_Temperature",
          "EMS_NEW_Pressure",
          "EMS_NEW_Humidity",
          "EMS_NEW_Flow_Rate",
          "EMS_NEW_Voltage",
          "EMS_NEW_Current",
          "EMS_NEW_Power",
          "EMS_NEW_Energy",
          "EMS_NEW_Frequency",
          "EMS_NEW_Speed",
          "EMS_NEW_Acceleration",
          "EMS_NEW_Force",
          "EMS_NEW_Torque",
          "EMS_NEW_Position",
          "EMS_NEW_Angle",
        ],
      )
    } catch (error) {
      console.error("Error fetching parameters", error)
      // Fallback data for demo purposes
      setParameters([
        "EMS_NEW_Temperature",
        "EMS_NEW_Pressure",
        "EMS_NEW_Humidity",
        "EMS_NEW_Flow_Rate",
        "EMS_NEW_Voltage",
        "EMS_NEW_Current",
        "EMS_NEW_Power",
        "EMS_NEW_Energy",
        "EMS_NEW_Frequency",
        "EMS_NEW_Speed",
        "EMS_NEW_Acceleration",
        "EMS_NEW_Force",
        "EMS_NEW_Torque",
        "EMS_NEW_Position",
        "EMS_NEW_Angle",
      ])
    }
  }

  const fetchGroupNames = async () => {
    try {
      // In a real app, replace with actual API call
      const response = await fetch(`${API_BASE_URL}/groups`)
      const data = await response.json()
      setGroupNameList(data?.map((item: any) => item.name) || ["Production", "Quality", "Maintenance", "Energy"])
    } catch (error) {
      console.error("Error fetching group names", error)
      // Fallback data for demo purposes
      setGroupNameList(["Production", "Quality", "Maintenance", "Energy"])
    }
  }

  const getDisplayName = (param: string) => {
    return param.startsWith("EMS_NEW_") ? param.replace("EMS_NEW_", "") : param
  }

  const filteredParameters = searchTerm
    ? parameters.filter((param) => param.toLowerCase().includes(searchTerm.toLowerCase()))
    : parameters

  const handleParameterChange = (param: string, checked: boolean) => {
    if (checked) {
      if (selectedParameters.length >= 12) {
        alert("You can select a maximum of 12 parameters.")
        return
      }
      setSelectedParameters([...selectedParameters, param])
      setParameterRanges({
        ...parameterRanges,
        [param]: {
          min: 18,
          max: 25,
          addRange: false,
          unit: "",
        },
      })
    } else {
      setSelectedParameters(selectedParameters.filter((p) => p !== param))
      const newRanges = { ...parameterRanges }
      delete newRanges[param]
      setParameterRanges(newRanges)
    }
  }

  const handleAdditionalInfoChange = (info: string, checked: boolean) => {
    if (checked) {
      setSelectedAdditionalInfo([...selectedAdditionalInfo, info])
    } else {
      setSelectedAdditionalInfo(selectedAdditionalInfo.filter((i) => i !== info))
    }
  }

  const updateParameterRange = (param: string, field: keyof ParameterRange, value: any) => {
    setParameterRanges((prev) => {
      const updated = { ...prev }
      updated[param] = { ...updated[param], [field]: value }

      // Clear error when updating values
      if (field === "min" || field === "max") {
        updated[param].rangeError = ""
      }

      return updated
    })
  }

  const validateReportName = () => {
    if (!reportName) {
      setReportNameError("Report Name is required")
      return false
    } else if (reportName.length > 20) {
      setReportNameError("Report Name cannot exceed 20 characters")
      return false
    } else {
      setReportNameError("")
      return true
    }
  }

  const validateGroupName = () => {
    if (!groupName) {
      setGroupNameError("Group Name is required")
      return false
    } else {
      setGroupNameError("")
      return true
    }
  }

  const validateParameters = () => {
    if (selectedParameters.length === 0) {
      setParametersError("At least one parameter must be selected")
      return false
    } else {
      setParametersError("")
      return true
    }
  }

  const validateAdditionalInfo = () => {
    if (selectedAdditionalInfo.length === 0) {
      setAdditionalInfoError("At least one Additional Info must be selected")
      return false
    } else {
      setAdditionalInfoError("")
      return true
    }
  }

  const validateRanges = () => {
    let hasRangeError = false
    const updatedRanges = { ...parameterRanges }

    for (const param of selectedParameters) {
      const range = updatedRanges[param]
      if (range?.addRange) {
        if (range.min === null || range.max === null || range.min >= range.max) {
          range.rangeError = "Start range must be less than end range"
          hasRangeError = true
        } else {
          range.rangeError = ""
        }
      }
    }

    setParameterRanges(updatedRanges)
    return !hasRangeError
  }

  const validateForm = () => {
    const isReportNameValid = validateReportName()
    const isGroupNameValid = validateGroupName()
    const areParametersValid = validateParameters()
    const isAdditionalInfoValid = validateAdditionalInfo()
    const areRangesValid = validateRanges()

    return isReportNameValid && isGroupNameValid && areParametersValid && isAdditionalInfoValid && areRangesValid
  }

  const handleSubmit = () => {
    if (validateForm()) {
      setIsConfirmDialogOpen(true)
    }
  }

  const confirmSubmission = async () => {
    setIsConfirmDialogOpen(false)

    const formattedParameters = selectedParameters.map((param) => {
      const range = parameterRanges[param]
      if (range && range.addRange) {
        return `${param}_From_${range.min}_To_${range.max}_Unit_${range.unit}`
      } else {
        return param
      }
    })

    const templateObj = {
      name: reportName,
      report_group: groupName,
      parameters: formattedParameters,
      additionalInfo: selectedAdditionalInfo.join(","),
    }

    console.log("Data to be sent:", templateObj)

    try {
      // In a real app, replace with actual API call
      const response = await fetch(`${API_BASE_URL}/createTemplate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(templateObj),
      })

      if (response.ok) {
        alert("Template added successfully")
        resetForm()
      } else {
        alert("Failed to add template")
      }
    } catch (error) {
      console.error("Error posting template", error)
      alert("Error creating template")
    }
  }

  const addGroup = async () => {
    const trimmedName = newGroupName.trim()
    if (!trimmedName) {
      setAddGroupMessage("Group name cannot be empty.")
      return
    }

    try {
      // In a real app, replace with actual API call
      const response = await fetch(`${API_BASE_URL}/add_group`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: trimmedName }),
      })

      if (response.ok) {
        setAddGroupMessage("Group added!")
        setGroupNameList([...groupNameList, trimmedName])
        setGroupName(trimmedName)
        setNewGroupName("")
        setIsAddGroupDialogOpen(false)
      } else {
        setAddGroupMessage("Failed to add group.")
      }
    } catch (error) {
      console.error("Error adding group", error)
      setAddGroupMessage("Failed to add group.")
    }
  }

  const resetForm = () => {
    setReportName("")
    setGroupName("")
    setSelectedParameters([])
    setSelectedAdditionalInfo([])
    setParameterRanges({})
    setReportNameError("")
    setGroupNameError("")
    setParametersError("")
    setAdditionalInfoError("")
    setSearchTerm("")
  }

  const goBack = () => {
    router.push("/main/dashboard")
  }

  return (
    <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={goBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Templates
        </Button>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 gap-6">
<TabsContent
  value="edit"
  className="mt-0 h-[calc(100vh-150px)] overflow-y-auto pr-2"
>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Left Column - Template Details */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reportName">Report Name</Label>
                    <Input
                      id="reportName"
                      value={reportName}
                      onChange={(e) => setReportName(e.target.value)}
                      placeholder="Enter report name"
                      maxLength={20}
                    />
                    {reportNameError && <p className="text-sm text-red-500">{reportNameError}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="groupName">Sensor ID</Label>
                    <div className="flex gap-2">
                      <Select value={groupName} onValueChange={setGroupName}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select group" />
                        </SelectTrigger>
                        <SelectContent>
                          {groupNameList.map((group) => (
                            <SelectItem key={group} value={group}>
                              {group}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="icon" onClick={() => setIsAddGroupDialogOpen(true)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {groupNameError && <p className="text-sm text-red-500">{groupNameError}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Additional Information</Label>
                    <div className="grid grid-cols-3 gap-4">
                      {additionalInfo.map((info) => (
                        <div key={info} className="flex items-center space-x-2">
                          <Checkbox
                            id={`info-${info}`}
                            checked={selectedAdditionalInfo.includes(info)}
                            onCheckedChange={(checked) => handleAdditionalInfoChange(info, checked === true)}
                          />
                          <Label htmlFor={`info-${info}`}>{info}</Label>
                        </div>
                      ))}
                    </div>
                    {additionalInfoError && <p className="text-sm text-red-500">{additionalInfoError}</p>}
                  </div>

                  {selectedParameters.length > 0 && (
                    <div className="space-y-2">
                      <Label>Selected Parameters</Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedParameters.map((param) => (
                          <Badge key={param} variant="secondary" className="flex items-center gap-1">
                            {getDisplayName(param)}
                            <button
                              onClick={() => handleParameterChange(param, false)}
                              className="ml-1 rounded-full hover:bg-muted p-1"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M18 6 6 18" />
                                <path d="m6 6 12 12" />
                              </svg>
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 flex justify-end space-x-2">
                    <Button variant="outline" onClick={resetForm}>
                      Reset
                    </Button>
                    <Button onClick={handleSubmit}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Template
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right Column - Parameter Selection */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="search-parameters">Search Parameters</Label>
                    <Input
                      id="search-parameters"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search parameters..."
                      className="mb-2"
                    />
                  </div>

                  {parametersError && (
                    <Alert variant="destructive">
                      <AlertDescription>{parametersError}</AlertDescription>
                    </Alert>
                  )}

                  <ScrollArea className="h-[300px] rounded-md border p-4">
                    <div className="space-y-2">
                      {filteredParameters.map((param) => (
                        <div key={param} className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={param}
                              checked={selectedParameters.includes(param)}
                              onCheckedChange={(checked) => handleParameterChange(param, checked === true)}
                            />
                            <Label htmlFor={param}>{getDisplayName(param)}</Label>
                          </div>

                          {selectedParameters.includes(param) && (
                            <div className="ml-6 pl-2 border-l-2 border-muted space-y-2">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id={`range-${param}`}
                                  checked={parameterRanges[param]?.addRange || false}
                                  onCheckedChange={(checked) => updateParameterRange(param, "addRange", checked)}
                                />
                                <Label htmlFor={`range-${param}`}>Add Range & Units</Label>
                              </div>

                              {parameterRanges[param]?.addRange && (
                                <div className="space-y-2 pt-2">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                      <Label htmlFor={`min-${param}`} className="text-xs">
                                        Min Value
                                      </Label>
                                      <Input
                                        id={`min-${param}`}
                                        type="number"
                                        value={parameterRanges[param]?.min || ""}
                                        onChange={(e) =>
                                          updateParameterRange(param, "min", Number.parseFloat(e.target.value))
                                        }
                                        className="h-8"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label htmlFor={`max-${param}`} className="text-xs">
                                        Max Value
                                      </Label>
                                      <Input
                                        id={`max-${param}`}
                                        type="number"
                                        value={parameterRanges[param]?.max || ""}
                                        onChange={(e) =>
                                          updateParameterRange(param, "max", Number.parseFloat(e.target.value))
                                        }
                                        className="h-8"
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <Label htmlFor={`unit-${param}`} className="text-xs">
                                      Unit
                                    </Label>
                                    <Input
                                      id={`unit-${param}`}
                                      value={parameterRanges[param]?.unit || ""}
                                      onChange={(e) => updateParameterRange(param, "unit", e.target.value)}
                                      placeholder="e.g. Â°C, kPa, %"
                                      className="h-8"
                                    />
                                  </div>
                                  {parameterRanges[param]?.rangeError && (
                                    <p className="text-xs text-red-500">{parameterRanges[param]?.rangeError}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                          <Separator className="my-2" />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="mt-0">
          <TemplatePreview
            reportName={reportName}
            groupName={groupName}
            parameters={selectedParameters.map((param) => {
              const range = parameterRanges[param]
              return {
                name: getDisplayName(param),
                original: param,
                range: range?.addRange ? { min: range.min, max: range.max, unit: range.unit } : null,
              }
            })}
            additionalInfo={selectedAdditionalInfo}
          />
        </TabsContent>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Template Creation</DialogTitle>
            <DialogDescription>
              Are you sure you want to create this template? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <p>
              <strong>Report Name:</strong> {reportName}
            </p>
            <p>
              <strong>Group:</strong> {groupName}
            </p>
            <p>
              <strong>Parameters:</strong> {selectedParameters.length}
            </p>
            <p>
              <strong>Additional Info:</strong> {selectedAdditionalInfo.join(", ")}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmSubmission}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Group Dialog */}
      <Dialog open={isAddGroupDialogOpen} onOpenChange={setIsAddGroupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Sensor ID</DialogTitle>
            <DialogDescription>Create a new group for organizing your templates.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-group-name">Group Name</Label>
              <Input
                id="new-group-name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter group name"
              />
            </div>
            {addGroupMessage && (
              <p className={`text-sm ${addGroupMessage.includes("Failed") ? "text-red-500" : "text-green-500"}`}>
                {addGroupMessage}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddGroupDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addGroup}>Add Sensor ID</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
</Tabs>   
    </div>
  )
}