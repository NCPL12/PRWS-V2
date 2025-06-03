"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ParameterWithRange {
  name: string
  original: string
  range: { min: number; max: number; unit: string } | null
}

interface TemplatePreviewProps {
  reportName: string
  groupName: string
  parameters: ParameterWithRange[]
  additionalInfo: string[]
}

export function TemplatePreview({ reportName, groupName, parameters, additionalInfo }: TemplatePreviewProps) {
  const [viewType, setViewType] = useState("table")

  // Generate mock data for preview
  const generateMockData = () => {
    return parameters.map((param) => {
      const baseValue = Math.random() * 100
      return {
        parameter: param.name,
        value: param.range
          ? Math.max(param.range.min, Math.min(param.range.max))
          : baseValue.toFixed(1),
        unit: param.range?.unit || "",
        min: additionalInfo.includes("MIN") ? (baseValue * 0.8).toFixed(1) : null,
        max: additionalInfo.includes("MAX") ? (baseValue * 1.2).toFixed(1) : null,
        avg: additionalInfo.includes("AVG") ? (baseValue * 1.1).toFixed(1) : null,
      }
    })
  }

  const mockData = generateMockData()

  if (!reportName && !groupName && parameters.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 flex flex-col items-center justify-center h-[400px] text-center">
          <p className="text-muted-foreground">Fill in the template details to see a preview</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{reportName || "Untitled Template"}</CardTitle>
            {groupName && <p className="text-sm text-muted-foreground">Group: {groupName}</p>}
          </div>
          <Tabs value={viewType} onValueChange={setViewType} className="w-[200px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="table">Table</TabsTrigger>
              <TabsTrigger value="chart">Chart</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <TabsContent value="table" className="mt-0">
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parameter</TableHead>
                  <TableHead>Value</TableHead>
                  {additionalInfo.includes("MIN") && <TableHead>Min</TableHead>}
                  {additionalInfo.includes("MAX") && <TableHead>Max</TableHead>}
                  {additionalInfo.includes("AVG") && <TableHead>Avg</TableHead>}
                  <TableHead>Range</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.parameter}</TableCell>
                    <TableCell>
                      {row.value} {row.unit}
                    </TableCell>
                    {additionalInfo.includes("MIN") && (
                      <TableCell>
                        {row.min} {row.unit}
                      </TableCell>
                    )}
                    {additionalInfo.includes("MAX") && (
                      <TableCell>
                        {row.max} {row.unit}
                      </TableCell>
                    )}
                    {additionalInfo.includes("AVG") && (
                      <TableCell>
                        {row.avg} {row.unit}
                      </TableCell>
                    )}
                    <TableCell>
                      {parameters[index].range ? (
                        <Badge variant="outline">
                          {parameters[index].range?.min} - {parameters[index].range?.max}{" "}
                          {parameters[index].range?.unit}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">No range</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="chart" className="mt-0">
          <div className="h-[500px] flex items-center justify-center flex-col gap-4">
            <div className="w-full h-64 bg-muted/30 rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Chart visualization would appear here</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
              {parameters.slice(0, 4).map((param, i) => (
                <Card key={i} className="h-24">
                  <CardContent className="p-4 flex flex-col justify-center h-full">
                    <p className="text-xs text-muted-foreground">{param.name}</p>
                    <p className="text-2xl font-bold">
                      {mockData[i].value} {param.range?.unit || ""}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </CardContent>
    </Card>
  )
}
