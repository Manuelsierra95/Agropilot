"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

import type { TableWidget as TableWidgetData } from "@workspace/copilot"

export function TableWidget({ widget }: { widget: TableWidgetData }) {
  return (
    <Card className="flex min-h-[420px] flex-col bg-background ring-0">
      {widget.title ? (
        <CardHeader>
          <CardTitle>{widget.title}</CardTitle>
        </CardHeader>
      ) : null}
      <CardContent className="min-h-0 flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {widget.columns.map((column) => (
                <TableHead key={column.key}>{column.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {widget.rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={widget.columns.length}
                  className="text-center text-muted-foreground"
                >
                  Sin datos
                </TableCell>
              </TableRow>
            ) : (
              widget.rows.map((row, index) => (
                <TableRow key={`${row.date}-${index}`}>
                  {widget.columns.map((column) => (
                    <TableCell key={`${column.key}-${index}`}>
                      {String(row[column.key] ?? "—")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
