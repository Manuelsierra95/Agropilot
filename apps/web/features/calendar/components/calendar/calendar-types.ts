import type { CalendarTask } from "@workspace/web/lib/calendar/types"

export type CalendarProps = {
  tasks: CalendarTask[]
  setTasks: (tasks: CalendarTask[]) => void
  mode: Mode
  setMode: (mode: Mode) => void
  date: Date
  setDate: (date: Date) => void
  calendarIconIsToday?: boolean
}

export type CalendarContextType = CalendarProps & {
  createTaskDialogOpen: boolean
  setCreateTaskDialogOpen: (open: boolean) => void
  taskDetailSheetOpen: boolean
  setTaskDetailSheetOpen: (open: boolean) => void
  selectedTaskId: string | null
  setSelectedTaskId: (taskId: string | null) => void
}

export type { CalendarTask }

export const calendarModes = ["day", "week", "month"] as const
export const calendarMobilesModes = ["day", "month"] as const
export type Mode = (typeof calendarModes)[number]
