import { useState } from "react"

import { CalendarContext } from "@workspace/web/features/calendar/components/calendar/calendar-context"
import type {
  CalendarTask,
  Mode,
} from "@workspace/web/features/calendar/components/calendar/calendar-types"
import { CreateTaskDialog } from "@workspace/web/components/tasks/create-task-dialog"
import { TaskDetailSheet } from "@workspace/web/components/tasks/task-detail-sheet"
import { CalendarDndProvider } from "@workspace/web/features/calendar/components/calendar/calendar-dnd-provider"

export default function CalendarProvider({
  tasks,
  setTasks,
  mode,
  setMode,
  date,
  setDate,
  calendarIconIsToday = true,
  children,
}: {
  tasks: CalendarTask[]
  setTasks: (tasks: CalendarTask[]) => void
  mode: Mode
  setMode: (mode: Mode) => void
  date: Date
  setDate: (date: Date) => void
  calendarIconIsToday: boolean
  children: React.ReactNode
}) {
  const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState(false)
  const [taskDetailSheetOpen, setTaskDetailSheetOpen] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  return (
    <CalendarContext.Provider
      value={{
        tasks,
        setTasks,
        mode,
        setMode,
        date,
        setDate,
        calendarIconIsToday,
        createTaskDialogOpen,
        setCreateTaskDialogOpen,
        taskDetailSheetOpen,
        setTaskDetailSheetOpen,
        selectedTaskId,
        setSelectedTaskId,
      }}
    >
      <CreateTaskDialog
        open={createTaskDialogOpen}
        onOpenChange={setCreateTaskDialogOpen}
        defaultDate={date.toISOString().slice(0, 10)}
      />
      <TaskDetailSheet
        open={taskDetailSheetOpen}
        onOpenChange={setTaskDetailSheetOpen}
        taskId={selectedTaskId}
        onTaskDeleted={(deletedTaskId) => {
          setTasks(tasks.filter((task) => task.id !== deletedTaskId))
        }}
      />
      <CalendarDndProvider>{children}</CalendarDndProvider>
    </CalendarContext.Provider>
  )
}
