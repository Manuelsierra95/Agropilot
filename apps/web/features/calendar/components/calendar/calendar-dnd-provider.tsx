"use client"

import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core"
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type CollisionDetection,
} from "@dnd-kit/core"
import { createContext, useContext, useRef, useState } from "react"
import { createPortal } from "react-dom"

import { DraggableCalendarTask } from "@workspace/web/features/calendar/components/calendar/draggable-calendar-task"
import type { CalendarDropZoneData } from "@workspace/web/features/calendar/components/calendar/calendar-drop-zone"
import { useCalendarContext } from "@workspace/web/features/calendar/components/calendar/calendar-context"
import { useMoveCalendarTask } from "@workspace/web/features/calendar/hooks/use-move-calendar-task"
import {
  isSameSchedule,
  moveTaskToDay,
  moveTaskToHour,
  toTaskUpdatePayload,
} from "@workspace/web/features/calendar/lib/task-schedule"
import type { CalendarTask } from "@workspace/web/lib/calendar/types"

type CalendarDndContextValue = {
  didDragRecently: () => boolean
}

const CalendarDndContext = createContext<CalendarDndContextValue | null>(null)

export function useCalendarDnd() {
  const context = useContext(CalendarDndContext)
  if (!context) {
    throw new Error("useCalendarDnd must be used within CalendarDndProvider")
  }
  return context
}

type CalendarDndProviderProps = {
  children: React.ReactNode
}

const calendarCollisionDetection: CollisionDetection = (args) => {
  const collisions = pointerWithin(args)
  const hourCollision = collisions.find((collision) =>
    String(collision.id).startsWith("calendar-hour:")
  )
  if (hourCollision) return [hourCollision]
  return collisions
}

export function CalendarDndProvider({ children }: CalendarDndProviderProps) {
  const { tasks, setTasks, mode } = useCalendarContext()
  const moveTask = useMoveCalendarTask(setTasks)
  const [activeTask, setActiveTask] = useState<CalendarTask | null>(null)
  const [activeMonthView, setActiveMonthView] = useState(false)
  const dragEndedAtRef = useRef(0)

  const didDragRecently = () => Date.now() - dragEndedAtRef.current < 300

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 8 },
    })
  )

  function handleDragStart(event: DragStartEvent) {
    const task = event.active.data.current?.task as CalendarTask | undefined
    if (!task) return
    setActiveTask(task)
    setActiveMonthView(mode === "month")
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    dragEndedAtRef.current = Date.now()
    setActiveTask(null)

    if (!over) return

    const task = active.data.current?.task as CalendarTask | undefined
    const dropData = over.data.current as CalendarDropZoneData | undefined

    if (!task || !dropData) return

    let updatedTask: CalendarTask

    if (dropData.type === "hour" && dropData.hour !== undefined) {
      updatedTask = moveTaskToHour(task, dropData.date, dropData.hour)
    } else {
      updatedTask = moveTaskToDay(task, dropData.date)
    }

    if (isSameSchedule(task, updatedTask)) return

    const nextTasks = tasks.map((item) =>
      item.id === task.id ? updatedTask : item
    )

    moveTask.mutate({
      taskId: task.id,
      payload: toTaskUpdatePayload(updatedTask),
      previousTasks: tasks,
      nextTasks,
    })
  }

  function handleDragCancel() {
    dragEndedAtRef.current = Date.now()
    setActiveTask(null)
  }

  return (
    <CalendarDndContext value={{ didDragRecently }}>
      <DndContext
        sensors={sensors}
        collisionDetection={calendarCollisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {children}
        {typeof document !== "undefined" &&
          createPortal(
            <DragOverlay dropAnimation={null}>
              {activeTask ? (
                <DraggableCalendarTask
                  task={activeTask}
                  month={activeMonthView}
                  isDragOverlay
                />
              ) : null}
            </DragOverlay>,
            document.body
          )}
      </DndContext>
    </CalendarDndContext>
  )
}
