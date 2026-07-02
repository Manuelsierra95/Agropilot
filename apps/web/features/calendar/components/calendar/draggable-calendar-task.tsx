"use client"

import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"

import { cn } from "@workspace/ui/lib/utils"
import CalendarTask, {
  calculateTaskPosition,
} from "@workspace/web/features/calendar/components/calendar/calendar-task"
import { useCalendarContext } from "@workspace/web/features/calendar/components/calendar/calendar-context"
import type { CalendarTask as CalendarTaskType } from "@workspace/web/features/calendar/components/calendar/calendar-types"

type DraggableCalendarTaskProps = {
  task: CalendarTaskType
  month?: boolean
  className?: string
  isDragOverlay?: boolean
}

export function DraggableCalendarTask({
  task,
  month = false,
  className,
  isDragOverlay = false,
}: DraggableCalendarTaskProps) {
  const { tasks } = useCalendarContext()
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      data: { type: "task", task },
    })

  const positionStyle = month ? undefined : calculateTaskPosition(task, tasks)
  const dragTransform = transform
    ? CSS.Translate.toString(transform)
    : undefined

  const wrapperStyle =
    positionStyle && dragTransform
      ? { ...positionStyle, transform: dragTransform }
      : positionStyle
        ? positionStyle
        : dragTransform
          ? { transform: dragTransform }
          : undefined

  if (isDragOverlay) {
    return (
      <CalendarTask
        task={task}
        month={month}
        className={cn("cursor-grabbing shadow-lg ring-2 ring-primary", className)}
        disableLayoutAnimation
      />
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={wrapperStyle}
      className={cn(
        month ? "relative" : "absolute z-10",
        isDragging && "opacity-40"
      )}
      {...listeners}
      {...attributes}
    >
      <CalendarTask
        task={task}
        month={month}
        embedded={!month}
        className={cn("h-full cursor-grab active:cursor-grabbing", className)}
        disableLayoutAnimation={isDragging}
      />
    </div>
  )
}
