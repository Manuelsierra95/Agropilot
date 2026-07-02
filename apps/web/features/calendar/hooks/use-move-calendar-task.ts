"use client"

import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

import type { TaskUpdateInput } from "@workspace/schemas"
import { api } from "@workspace/web/lib/api"
import type { CalendarTask } from "@workspace/web/lib/calendar/types"

type MoveCalendarTaskVariables = {
  taskId: string
  payload: TaskUpdateInput
  previousTasks: CalendarTask[]
  nextTasks: CalendarTask[]
}

export function useMoveCalendarTask(
  setTasks: (tasks: CalendarTask[]) => void
) {
  return useMutation({
    mutationFn: ({ taskId, payload }: MoveCalendarTaskVariables) =>
      api.tasks.updateTask(taskId, payload),
    onMutate: ({ nextTasks }) => {
      setTasks(nextTasks)
    },
    onError: (_error, { previousTasks }) => {
      setTasks(previousTasks)
      toast.error("No se pudo reprogramar la tarea")
    },
  })
}
