import { Button, buttonVariants } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { ArrowRightIcon } from "lucide-react"
import type { CalendarTask } from "@workspace/web/lib/calendar/types"
import Link from "next/link"

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
})

const timeFormatter = new Intl.DateTimeFormat("es-ES", {
  hour: "2-digit",
  minute: "2-digit",
})

const typeLabels: Record<string, string> = {
  irrigation: "Riego",
  treatment: "Tratamiento",
  fertilization: "Fertilizacion",
  harvest: "Cosecha",
  inspection: "Inspeccion",
  alert: "Alerta",
}

const statusLabels: Record<CalendarTask["status"], string> = {
  pending: "Pendiente",
  in_progress: "En curso",
  completed: "Completado",
}

const statusTone: Record<CalendarTask["status"], string> = {
  pending: "bg-amber-500/10 text-amber-600",
  in_progress: "bg-sky-500/10 text-sky-600",
  completed: "bg-emerald-500/10 text-emerald-600",
}

function formatEventRange(start: Date, end: Date) {
  const sameDay = start.toDateString() === end.toDateString()
  if (sameDay) {
    return `${dateFormatter.format(start)} ${timeFormatter.format(start)} a ${timeFormatter.format(end)}`
  }
  return `${dateFormatter.format(start)} ${timeFormatter.format(start)} a ${dateFormatter.format(end)} ${timeFormatter.format(end)}`
}

function getVisibleTasks(data: CalendarTask[]) {
  const now = new Date()
  const weekEnd = new Date(now)
  weekEnd.setDate(weekEnd.getDate() + 7)

  const sorted = [...data].sort((a, b) => a.start.getTime() - b.start.getTime())
  const upcoming = sorted.filter(
    (task) => task.start >= now && task.start <= weekEnd
  )

  const visible = (upcoming.length > 0 ? upcoming : sorted).slice(0, 6)
  return {
    visible,
    count: upcoming.length > 0 ? upcoming.length : sorted.length,
    hasUpcoming: upcoming.length > 0,
  }
}

interface RecentEventsProps {
  data: CalendarTask[]
  className?: string
}

export function RecentEvents({ data, className }: RecentEventsProps) {
  const { visible, count, hasUpcoming } = getVisibleTasks(data)

  return (
    <Card className={cn("relative w-full bg-background ring-0", className)}>
      <CardHeader>
        <CardTitle className="text-balance">Tareas</CardTitle>
        <CardDescription className="text-pretty">
          {hasUpcoming
            ? "Proximas tareas de la semana."
            : "Proximas tareas registradas."}
        </CardDescription>
      </CardHeader>
      <CardContent className="mask-b-from-50% mask-b-to-100% p-0 pb-2">
        <Table className="border-t">
          <TableCaption className="sr-only">
            Eventos recientes con estado, tipo y hora.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6" scope="col">
                Evento
              </TableHead>
              <TableHead scope="col">Parcela</TableHead>
              <TableHead className="text-end" scope="col">
                Tipo
              </TableHead>
              <TableHead className="text-end" scope="col">
                Estado
              </TableHead>
              <TableHead className="pr-6 text-end" scope="col">
                Completar
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow>
                <TableCell
                  className="px-6 py-6 text-center text-xs text-muted-foreground"
                  colSpan={5}
                >
                  Sin tareas proximas.
                </TableCell>
              </TableRow>
            ) : (
              visible.map((task) => {
                const isCompleted = task.status === "completed"

                return (
                  <TableRow className="hover:bg-transparent" key={task.id}>
                    <TableCell className="max-w-[260px] truncate pl-6">
                      <div className="flex items-center gap-2">
                        <Badge
                          className="h-5 px-2 text-[10px]"
                          variant="outline"
                        >
                          {typeLabels[task.category] ?? task.category}
                        </Badge>
                        <span className="min-w-0 truncate text-xs font-medium">
                          {task.title}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatEventRange(task.start, task.end)}
                      </p>
                    </TableCell>
                    <TableCell className="max-w-[220px] truncate text-xs text-muted-foreground">
                      {task.parcelName}
                    </TableCell>
                    <TableCell className="text-end text-xs text-muted-foreground">
                      {task.category}
                    </TableCell>
                    <TableCell className="text-end">
                      <Badge
                        className={`h-5 px-2 text-[10px] ${statusTone[task.status]}`}
                        variant="secondary"
                      >
                        {statusLabels[task.status] ?? task.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6 text-end">
                      <Button
                        size="sm"
                        variant={isCompleted ? "secondary" : "outline"}
                        disabled={isCompleted}
                      >
                        {isCompleted ? "Completado" : "Completar"}
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </CardContent>

      <div className="absolute inset-x-0 bottom-0 flex h-1/5 items-center justify-center bg-background mask-t-from-30%">
        <Link
          href={"/dashboard/transactions"}
          className={cn(buttonVariants({ variant: "ghost" }), "relative")}
        >
          Ver todas las tareas ({count})
          <ArrowRightIcon aria-hidden="true" />
        </Link>
      </div>
    </Card>
  )
}
