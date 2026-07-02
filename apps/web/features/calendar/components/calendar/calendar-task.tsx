import { CalendarTask as CalendarTaskType } from "@workspace/web/features/calendar/components/calendar/calendar-types"
import { useCalendarContext } from "@workspace/web/features/calendar/components/calendar/calendar-context"
import { format, isSameDay, isSameMonth } from "date-fns"
import { cn } from "@workspace/ui/lib/utils"
import { motion, MotionConfig, AnimatePresence } from "motion/react"

interface TaskPosition {
  left: string
  width: string
  top: string
  height: string
}

function getOverlappingTasks(
  currentTask: CalendarTaskType,
  tasks: CalendarTaskType[]
): CalendarTaskType[] {
  return tasks.filter((task) => {
    if (task.id === currentTask.id) return false
    return (
      currentTask.start < task.end &&
      currentTask.end > task.start &&
      isSameDay(currentTask.start, task.start)
    )
  })
}

export function calculateTaskPosition(
  task: CalendarTaskType,
  allTasks: CalendarTaskType[]
): TaskPosition {
  const overlappingTasks = getOverlappingTasks(task, allTasks)
  const group = [task, ...overlappingTasks].sort(
    (a, b) => a.start.getTime() - b.start.getTime()
  )
  const position = group.indexOf(task)
  const width = `${100 / (overlappingTasks.length + 1)}%`
  const left = `${(position * 100) / (overlappingTasks.length + 1)}%`

  const startHour = task.start.getHours()
  const startMinutes = task.start.getMinutes()

  let endHour = task.end.getHours()
  let endMinutes = task.end.getMinutes()

  if (!isSameDay(task.start, task.end)) {
    endHour = 23
    endMinutes = 59
  }

  const topPosition = startHour * 128 + (startMinutes / 60) * 128
  const duration = endHour * 60 + endMinutes - (startHour * 60 + startMinutes)
  const height = (duration / 60) * 128

  return {
    left,
    width,
    top: `${topPosition}px`,
    height: `${height}px`,
  }
}

export default function CalendarTask({
  task,
  month = false,
  className,
  disableLayoutAnimation = false,
  embedded = false,
}: {
  task: CalendarTaskType
  month?: boolean
  className?: string
  disableLayoutAnimation?: boolean
  embedded?: boolean
}) {
  const { tasks, setSelectedTaskId, setTaskDetailSheetOpen, date } =
    useCalendarContext()
  const style = month || embedded ? {} : calculateTaskPosition(task, tasks)

  const isTaskInCurrentMonth = isSameMonth(task.start, date)
  const animationKey = `${task.id}-${
    isTaskInCurrentMonth ? "current" : "adjacent"
  }`

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait">
        <motion.div
          className={cn(
            `cursor-pointer truncate rounded-md px-3 py-1.5 transition-all duration-300 bg-${task.color}-500/10 hover:bg-${task.color}-500/20 border border-${task.color}-500`,
            !month && !embedded && "absolute",
            embedded && "h-full",
            className
          )}
          style={style}
          onClick={(e) => {
            e.stopPropagation()
            setSelectedTaskId(task.id)
            setTaskDetailSheetOpen(true)
          }}
          initial={{
            opacity: 0,
            y: -3,
            scale: 0.98,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            scale: 0.98,
            transition: {
              duration: 0.15,
              ease: "easeOut",
            },
          }}
          transition={{
            duration: 0.2,
            ease: [0.25, 0.1, 0.25, 1],
            opacity: {
              duration: 0.2,
              ease: "linear",
            },
            layout: {
              duration: 0.2,
              ease: "easeOut",
            },
          }}
          layoutId={
            disableLayoutAnimation
              ? undefined
              : `task-${animationKey}-${month ? "month" : "day"}`
          }
        >
          <motion.div
            className={cn(
              `flex w-full flex-col text-${task.color}-500`,
              month && "flex-row items-center justify-between"
            )}
            layout="position"
          >
            <p className={cn("truncate font-bold", month && "text-xs")}>
              {task.title}
            </p>
            <p className={cn("text-sm", month && "text-xs")}>
              <span>{format(task.start, "h:mm a")}</span>
              <span className={cn("mx-1", month && "hidden")}>-</span>
              <span className={cn(month && "hidden")}>
                {format(task.end, "h:mm a")}
              </span>
            </p>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </MotionConfig>
  )
}
