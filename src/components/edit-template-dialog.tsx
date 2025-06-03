"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { X, ChevronDown } from "lucide-react"

interface EditTemplateDialogProps {
  isEditDialogOpen: boolean
  setIsEditDialogOpen: (open: boolean) => void
  selectedTemplate: any
  setSelectedTemplate: (template: any) => void
  selectedGroup: string
  setSelectedGroup: (group: string) => void
  groupNames: string[]
  additionalInfoList: string[]
  selectedAdditionalInfo: string[]
  setSelectedAdditionalInfo: (info: string[]) => void
  selectedParameters: any[]
  setSelectedParameters: (params: any[]) => void
  unselectedParameters: string[]
  updateParameterRange: (index: number, field: string, value: string) => void
  handleParameterSelection: (param: string, checked: boolean) => void
  clearSelections: () => void
  saveEditedTemplate: () => void
}

export default function EditTemplateDialog({
  isEditDialogOpen,
  setIsEditDialogOpen,
  selectedTemplate,
  setSelectedTemplate,
  selectedGroup,
  setSelectedGroup,
  groupNames,
  additionalInfoList,
  selectedAdditionalInfo,
  setSelectedAdditionalInfo,
  selectedParameters,
  setSelectedParameters,
  unselectedParameters,
  updateParameterRange,
  handleParameterSelection,
  clearSelections,
  saveEditedTemplate,
}: EditTemplateDialogProps) {
  return (
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogContent className="max-w-3xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Edit Template</DialogTitle>
        </DialogHeader>

        {selectedTemplate && (
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full px-6">
              <div className="space-y-6 py-4">
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
                    <Label>Selected Parameters</Label>
                  </div>

                  {selectedParameters.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No parameters selected</div>
                  ) : (
                    <div className="space-y-4">
                      {selectedParameters.map((param, index) => (
                        <div key={index} className="border rounded-md p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{param.baseName}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedParameters((prev) => prev.filter((_, i) => i !== index))
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`min-${index}`}>Min Value</Label>
                              <Input
                                id={`min-${index}`}
                                type="number"
                                value={param.range.min === null ? "" : param.range.min}
                                onChange={(e) => updateParameterRange(index, "min", e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`max-${index}`}>Max Value</Label>
                              <Input
                                id={`max-${index}`}
                                type="number"
                                value={param.range.max === null ? "" : param.range.max}
                                onChange={(e) => updateParameterRange(index, "max", e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`unit-${index}`}>Unit</Label>
                              <Input
                                id={`unit-${index}`}
                                value={param.range.unit}
                                onChange={(e) => updateParameterRange(index, "unit", e.target.value)}
                              />
                            </div>
                          </div>

                          {param.range.min !== null &&
                            param.range.max !== null &&
                            param.range.min >= param.range.max && (
                              <Alert variant="destructive" className="mt-2">
                                <AlertDescription>Min value must be less than max value</AlertDescription>
                              </Alert>
                            )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Available Parameters</Label>
                  <Collapsible className="border rounded-md">
                    <CollapsibleTrigger className="flex w-full items-center justify-between p-4">
                      <span>Add Parameters</span>
                      <ChevronDown className="h-4 w-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-4 pt-0 border-t">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {unselectedParameters.map((param) => (
                          <div key={param} className="flex items-center space-x-2">
                            <Checkbox
                              id={`param-${param}`}
                              onCheckedChange={(checked) => handleParameterSelection(param, !!checked)}
                            />
                            <Label htmlFor={`param-${param}`}>{param}</Label>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>

                {/* Add some bottom padding to ensure the last element is fully visible */}
                <div className="pb-4" />
              </div>
            </ScrollArea>
          </div>
        )}

        <DialogFooter className="px-6 py-4 border-t bg-background">
          <Button
            variant="outline"
            onClick={() => {
              setIsEditDialogOpen(false)
              clearSelections()
            }}
          >
            Cancel
          </Button>
          <Button onClick={saveEditedTemplate}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
