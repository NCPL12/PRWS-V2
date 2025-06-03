"use client"

import { useState, useEffect } from "react"
import { Search, ChevronDown, ChevronUp, Edit, Plus, X, ArrowUpDown } from 'lucide-react'
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import React from "react"
import Image from "next/image";
import BottomRightLogo from "./BottomRightLogo"

// Mock API URL - replace with your actual API URL in production
const API_BASE_URL = "http://localhost:8080/bms-reports/v1"

interface TemplateData {
  id: number
  name: string
  report_group: string
  additionalInfo: string
  parameters: string[]
  selected?: boolean
}

interface ParameterWithRange {
  baseName: string
  range: {
    min: number | null
    max: number | null
    unit: string
  }
  displayName?: string
}

export function TemplateList() {
  // State variables
  const [templates, setTemplates] = useState<TemplateData[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<TemplateData[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({})
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null)
  const [parameters, setParameters] = useState<string[]>([])
  const [selectedParameters, setSelectedParameters] = useState<ParameterWithRange[]>([])
  const [unselectedParameters, setUnselectedParameters] = useState<string[]>([])
  const [groupNames, setGroupNames] = useState<string[]>([])
  const [selectedGroup, setSelectedGroup] = useState("")
  const [additionalInfoList] = useState(["MAX", "AVG", "MIN"])
  const [selectedAdditionalInfo, setSelectedAdditionalInfo] = useState<string[]>([])
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: "ascending" | "descending"
  } | null>(null)

  const username = typeof window !== "undefined" ? localStorage.getItem("username") || "User" : "User"
  const router = useRouter()

  // Mock data for development
  const mockTemplates: TemplateData[] = [
    {
      id: 1,
      name: "Monthly Sales Report",
      report_group: "Sales",
      additionalInfo: "MAX,AVG",
      parameters: ["Revenue_From_1000_To_5000", "Profit_Unit_USD", "Customers"],
    },
    {
      id: 2,
      name: "Quarterly Performance",
      report_group: "Performance",
      additionalInfo: "MIN",
      parameters: ["Efficiency_From_50_To_100_Unit_%", "Output", "Quality_From_1_To_10"],
    },
    {
      id: 3,
      name: "Annual Budget",
      report_group: "Finance",
      additionalInfo: "MAX,MIN",
      parameters: ["Expenses_Unit_USD", "Revenue_From_10000_To_50000", "Profit_From_5000_To_20000_Unit_USD"],
    },
    {
      id: 4,
      name: "Employee Satisfaction",
      report_group: "HR",
      additionalInfo: "AVG",
      parameters: ["Satisfaction_From_1_To_10", "Retention_Unit_%", "Engagement"],
    },
    {
      id: 5,
      name: "Product Performance",
      report_group: "Sales",
      additionalInfo: "MAX,AVG,MIN",
      parameters: ["Sales_From_100_To_1000", "Returns_Unit_%", "CustomerRating_From_1_To_5"],
    },
  ]

  const mockParameters = [
    "Revenue",
    "Profit",
    "Customers",
    "Efficiency",
    "Output",
    "Quality",
    "Expenses",
    "Satisfaction",
    "Retention",
    "Engagement",
    "Sales",
    "Returns",
    "CustomerRating",
  ]

  const mockGroups = ["Sales", "Performance", "Finance", "HR", "Marketing", "Operations"]

  useEffect(() => {
    fetchTemplates()
    fetchParameters()
    fetchGroupNames()
  }, [])

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/templates`)
      const data = await res.json()
      setTemplates(data)
      setFilteredTemplates(data)
    } catch (error) {
      console.error("Error fetching templates:", error)
    }
  }

  const fetchParameters = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/parameters`)
      const data = await res.json()
      setParameters(data)
    } catch (error) {
      console.error("Error fetching parameters:", error)
    }
  }

  const fetchGroupNames = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/groups`)
      const data = await res.json()
      const names = data.map((g: any) => g.name)
      setGroupNames(names)
    } catch (error) {
      console.error("Error fetching groups:", error)
    }
  }

  // Update unselected parameters when parameters or selected parameters change
  useEffect(() => {
    if (selectedTemplate) {
      const selectedBaseNames = selectedParameters.map((param) => param.baseName)
      setUnselectedParameters(parameters.filter((param) => !selectedBaseNames.includes(param)))
    }
  }, [parameters, selectedParameters, selectedTemplate])

  // Filter templates based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredTemplates(templates)
    } else {
      const lowerCaseQuery = searchQuery.toLowerCase()
      setFilteredTemplates(templates.filter((item) => item.name.toLowerCase().includes(lowerCaseQuery)))
    }
  }, [searchQuery, templates])

  // Parse parameters to extract range and unit information
  const parseParameters = (paramList: string[]): ParameterWithRange[] => {
    return paramList.map((param) => {
      const rangeMatch = param.match(/(.*)_From_(\d+)_To_(\d+)_?(.*)?/)
      const unitMatch = param.match(/(.*)_Unit_(.*)/)

      if (rangeMatch) {
        const baseName = rangeMatch[1]
        const min = +rangeMatch[2]
        const max = +rangeMatch[3]
        const unit = rangeMatch[4] || ""
        return {
          baseName,
          range: { min, max, unit },
          displayName: `${baseName} (${min}-${max}${unit ? " " + unit : ""})`,
        }
      } else if (unitMatch) {
        const baseName = unitMatch[1]
        const unit = unitMatch[2]
        return {
          baseName,
          range: { min: null, max: null, unit },
          displayName: `${baseName} (${unit})`,
        }
      } else {
        return {
          baseName: param,
          range: { min: null, max: null, unit: "" },
          displayName: param,
        }
      }
    })
  }

  // Get a shortened version of parameters for display
  const getShortParameters = (parameters: string[]): string => {
    if (parameters.length === 0) {
      return ""
    }
    return parameters.slice(0, 2).join(", ") + (parameters.length > 2 ? ", ..." : "")
  }

  // Toggle row expansion to show parameter details
  const toggleRowExpansion = (id: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // Handle template selection
  const handleTemplateSelection = (id: number) => {
    setTemplates((prev) =>
      prev.map((template) => (template.id === id ? { ...template, selected: !template.selected } : template)),
    )
    setFilteredTemplates((prev) =>
      prev.map((template) => (template.id === id ? { ...template, selected: !template.selected } : template)),
    )
  }

  // Handle edit button click
  const handleEditClick = () => {
    const selectedItems = filteredTemplates.filter((item) => item.selected)

    if (selectedItems.length !== 1) {
      alert("Please select exactly one template to edit.")
      return
    }

    const template = selectedItems[0]
    setSelectedTemplate(template)
    setSelectedGroup(template.report_group)
    setSelectedAdditionalInfo(template.additionalInfo ? template.additionalInfo.split(",") : [])
    setSelectedParameters(parseParameters(template.parameters))
    setIsEditDialogOpen(true)
  }

  // Handle delete button click
  const handleDeleteClick = () => {
    const hasSelectedItems = filteredTemplates.some((item) => item.selected)

    if (!hasSelectedItems) {
      alert("Please select at least one template to delete.")
      return
    }

    setIsDeleteDialogOpen(true)
  }

  const confirmDeletion = async () => {
    const selectedItems = filteredTemplates.filter((item) => item.selected)
    const idsToDelete = selectedItems.map((item) => item.id)
    const namesToDelete = selectedItems.map((item) => item.name)

    if (idsToDelete.length === 0) {
      alert("No templates selected for deletion.")
      return
    }

    try {
      await fetch(`${API_BASE_URL}/deleteTemplates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(idsToDelete),
      })

      await fetch(`${API_BASE_URL}/log-deleted-template`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          templateIds: idsToDelete,
          templateNames: namesToDelete,
        }),
      })

      setTemplates((prev) => prev.filter((item) => !item.selected))
      setFilteredTemplates((prev) => prev.filter((item) => !item.selected))
      setIsDeleteDialogOpen(false)
    } catch (err) {
      console.error("Error deleting templates:", err)
    }
  }

  // Handle parameter selection in edit dialog
  const handleParameterSelection = (paramName: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedParameters((prev) => [...prev, { baseName: paramName, range: { min: null, max: null, unit: "" } }])
    } else {
      setSelectedParameters((prev) => prev.filter((param) => param.baseName !== paramName))
    }
  }

  // Update parameter range in edit dialog
  const updateParameterRange = (index: number, field: "min" | "max" | "unit", value: any) => {
    setSelectedParameters((prev) => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        range: {
          ...updated[index].range,
          [field]: field === "unit" ? value : value === "" ? null : Number(value),
        },
      }
      return updated
    })
  }

  // Validate parameter ranges
  const validateRanges = (): boolean => {
    for (const param of selectedParameters) {
      if (param.range.min !== null && param.range.max !== null && param.range.min >= param.range.max) {
        return false
      }
    }
    return true
  }

  const saveEditedTemplate = async () => {
    if (!selectedTemplate) return

    if (!validateRanges()) {
      alert("Start range must be less than end range for all parameters")
      return
    }

    const updatedParameters = selectedParameters.map((p) => {
      const { baseName, range } = p
      const { min, max, unit } = range
      if (min !== null && max !== null && unit) {
        return `${baseName}_From_${min}_To_${max}_Unit_${unit}`
      } else if (min !== null && max !== null) {
        return `${baseName}_From_${min}_To_${max}`
      } else if (unit) {
        return `${baseName}_Unit_${unit}`
      } else {
        return baseName
      }
    })

    const updatedData = {
      name: selectedTemplate.name,
      report_group: selectedGroup,
      parameters: updatedParameters,
      additionalInfo: selectedAdditionalInfo.join(","),
    }

    try {
      const res = await fetch(`${API_BASE_URL}/editTemplate/${selectedTemplate.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      })

      const result = await res.json()

      setTemplates((prev) => prev.map((t) => (t.id === selectedTemplate.id ? result : t)))
      setFilteredTemplates((prev) => prev.map((t) => (t.id === selectedTemplate.id ? result : t)))

      await fetch(`${API_BASE_URL}/log-edited-template`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          templateId: selectedTemplate.id,
          templateName: selectedTemplate.name,
        }),
      })

      setIsEditDialogOpen(false)
      clearSelections()
    } catch (error) {
      console.error("Error saving template:", error)
    }
  }

  // Clear all selections
  const clearSelections = () => {
    setTemplates((prev) => prev.map((template) => ({ ...template, selected: false })))
    setFilteredTemplates((prev) => prev.map((template) => ({ ...template, selected: false })))
    setSelectedTemplate(null)
    setSelectedParameters([])
    setSelectedGroup("")
    setSelectedAdditionalInfo([])
  }

  // Handle sorting
  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending"

    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }

    setSortConfig({ key, direction })

    setFilteredTemplates((prev) => {
      const sortedData = [...prev]
      sortedData.sort((a, b) => {
        if (key === "id") {
          return direction === "ascending" ? a.id - b.id : b.id - a.id
        } else {
          const aValue = (a as any)[key].toLowerCase()
          const bValue = (b as any)[key].toLowerCase()

          if (aValue < bValue) {
            return direction === "ascending" ? -1 : 1
          }
          if (aValue > bValue) {
            return direction === "ascending" ? 1 : -1
          }
          return 0
        }
      })
      return sortedData
    })
  }

  // Get sort direction indicator
  const getSortDirectionIndicator = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="ml-1 h-4 w-4" />
    }
    return sortConfig.direction === "ascending" ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
       <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleEditClick}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>

          <Button onClick={() => router.push("/main/new-template")}>
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        </div>
      </div>

     

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox />
                </TableHead>
                <TableHead className="w-12">
                  <Button variant="ghost" className="p-0 font-medium" onClick={() => requestSort("id")}>
                    ID {getSortDirectionIndicator("id")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" className="p-0 font-medium text-left" onClick={() => requestSort("name")}>
                    Name {getSortDirectionIndicator("name")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="p-0 font-medium text-left"
                    onClick={() => requestSort("report_group")}
                  >
                    Group {getSortDirectionIndicator("report_group")}
                  </Button>
                </TableHead>
                <TableHead>Parameters</TableHead>
                <TableHead>Additional Info</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground ">
                    No templates found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTemplates.map((template) => (
                  <React.Fragment key={template.id}>
                    <TableRow
                      key={template.id}
                      className={`${template.selected ? "bg-accent/50" : ""} hover:bg-muted/50 cursor-pointer transition-colors`}
                      onClick={() => handleTemplateSelection(template.id)}
                    >
                      <TableCell>
                        <Checkbox
                          checked={template.selected}
                          onCheckedChange={() => handleTemplateSelection(template.id)}
                        />
                      </TableCell>
                      <TableCell>{template.id}</TableCell>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{template.report_group}</Badge>
                      </TableCell>
                      <TableCell>{getShortParameters(template.parameters)}</TableCell>
                      <TableCell>{template.additionalInfo || "-"}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleRowExpansion(template.id)
                          }}
                          className="hover:bg-accent transition-colors"
                        >
                          {expandedRows[template.id] ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedRows[template.id] && (
                      <TableRow className="animate-in fade-in-50 duration-300">
                        <TableCell colSpan={7} className="bg-muted/50 p-4">
                          <div className="space-y-2">
                            <h4 className="font-medium">Parameters:</h4>
                            <ul className="list-disc pl-5 space-y-1">
                              {parseParameters(template.parameters).map((param, idx) => (
                                <li key={idx}>{param.displayName || param.baseName}</li>
                              ))}
                            </ul>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
</div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete the selected template(s)?</p>
            <p className="text-sm text-muted-foreground mt-2">This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeletion}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>Edit Template</DialogTitle>
          </DialogHeader>

          {selectedTemplate && (
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full px-6">
                <div className="space-y-6 py-6">
                  <div className="space-y-2">
                    <Label htmlFor="template-name">Template Name</Label>
                    <Input
                      id="template-name"
                      value={selectedTemplate.name}
                      onChange={(e) =>
                        setSelectedTemplate({
                          ...selectedTemplate,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="template-group">Report Group</Label>
                    <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a group" />
                      </SelectTrigger>
                      <SelectContent>
                        {groupNames.map((group) => (
                          <SelectItem key={group} value={group}>
                            {group}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Additional Info</Label>
                    <div className="flex flex-wrap gap-2">
                      {additionalInfoList.map((info) => (
                        <div key={info} className="flex items-center space-x-2">
                          <Checkbox
                            id={`info-${info}`}
                            checked={selectedAdditionalInfo.includes(info)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedAdditionalInfo((prev) => [...prev, info])
                              } else {
                                setSelectedAdditionalInfo((prev) => prev.filter((item) => item !== info))
                              }
                            }}
                          />
                          <Label htmlFor={`info-${info}`}>{info}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Selected Parameters ({selectedParameters.length})</Label>
                      <Badge variant="secondary">{selectedParameters.length} selected</Badge>
                    </div>

                    {selectedParameters.length === 0 ? (
                      <div className="text-sm text-muted-foreground p-4 border border-dashed rounded-md text-center">
                        No parameters selected. Use the "Add Parameters" section below to add some.
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto border rounded-md p-4">
                        {selectedParameters.map((param, index) => (
                          <div key={index} className="border rounded-md p-4 space-y-3 bg-card">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{param.baseName}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedParameters((prev) => prev.filter((_, i) => i !== index))
                                }}
                                className="h-8 w-8 p-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <Label htmlFor={`min-${index}`} className="text-xs">
                                  Min Value
                                </Label>
                                <Input
                                  id={`min-${index}`}
                                  type="number"
                                  placeholder="Min"
                                  value={param.range.min === null ? "" : param.range.min}
                                  onChange={(e) => updateParameterRange(index, "min", e.target.value)}
                                  className="h-8"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor={`max-${index}`} className="text-xs">
                                  Max Value
                                </Label>
                                <Input
                                  id={`max-${index}`}
                                  type="number"
                                  placeholder="Max"
                                  value={param.range.max === null ? "" : param.range.max}
                                  onChange={(e) => updateParameterRange(index, "max", e.target.value)}
                                  className="h-8"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor={`unit-${index}`} className="text-xs">
                                  Unit
                                </Label>
                                <Input
                                  id={`unit-${index}`}
                                  placeholder="Unit"
                                  value={param.range.unit}
                                  onChange={(e) => updateParameterRange(index, "unit", e.target.value)}
                                  className="h-8"
                                />
                              </div>
                            </div>

                            {param.range.min !== null &&
                              param.range.max !== null &&
                              param.range.min >= param.range.max && (
                                <Alert variant="destructive" className="py-2">
                                  <AlertDescription className="text-xs">
                                    Min value must be less than max value
                                  </AlertDescription>
                                </Alert>
                              )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Available Parameters</Label>
                      <Badge variant="outline">{unselectedParameters.length} available</Badge>
                    </div>
                    <Collapsible className="border rounded-md">
                      <CollapsibleTrigger className="flex w-full items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                        <span className="text-sm font-medium">Add Parameters</span>
                        <ChevronDown className="h-4 w-4" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="border-t">
                        <div className="p-4">
                          {unselectedParameters.length === 0 ? (
                            <div className="text-sm text-muted-foreground text-center py-4">
                              All available parameters have been selected
                            </div>
                          ) : (
                            <div className="max-h-48 overflow-y-auto">
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2">
                                {unselectedParameters.map((param) => (
                                  <div
                                    key={param}
                                    className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded"
                                  >
                                    <Checkbox
                                      id={`param-${param}`}
                                      onCheckedChange={(checked) => handleParameterSelection(param, !!checked)}
                                    />
                                    <Label htmlFor={`param-${param}`} className="text-sm cursor-pointer flex-1">
                                      {param}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>

                  {/* Add some bottom padding for better scrolling */}
                  <div className="h-4"></div>
                </div>
              </ScrollArea>
            </div>
          )}

          <DialogFooter className="px-6 py-4 border-t bg-background">
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-muted-foreground">
                {selectedParameters.length} parameter{selectedParameters.length !== 1 ? "s" : ""} selected
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false)
                    clearSelections()
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={saveEditedTemplate} disabled={!validateRanges()}>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div>
        
      </div>
         <BottomRightLogo />


    </div>
  )
}