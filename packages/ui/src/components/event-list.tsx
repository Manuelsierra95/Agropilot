"use client"

import {
  AnimatePresence,
  motion,
  MotionConfig,
  type Transition,
} from "motion/react"
import { useState } from "react"
import {
  Droplets,
  Leaf,
  Scissors,
  Search,
  ShieldCheck,
  TriangleAlert,
  Wheat,
  X,
} from "lucide-react"
import useMeasure from "react-use-measure"

export type FarmEventType =
  | "irrigation"
  | "fertilization"
  | "treatment"
  | "harvest"
  | "pruning"
  | "inspection"
  | "alert"

export type FarmEventStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "skipped"

export type FarmEventPriority = "low" | "medium" | "high" | "critical"

export interface FarmEvent {
  id: string
  title: string
  description?: string
  type: FarmEventType
  category: string
  color: string
  startAt: string
  endAt?: string
  allDay?: boolean
  status: FarmEventStatus
  priority: FarmEventPriority
  parcelId: string
  crop?: string
  recommendation?: string
  reason?: string
  impact?: {
    cost?: number
    expectedYieldImpact?: number
    waterUse?: number
  }
  tags?: string[]
  source: "manual" | "system" | "integration"
  createdAt: string
  updatedAt: string
}

const TYPE_ICON: Record<FarmEventType, React.ReactNode> = {
  irrigation: <Droplets className="size-4" />,
  fertilization: <Leaf className="size-4" />,
  treatment: <ShieldCheck className="size-4" />,
  harvest: <Wheat className="size-4" />,
  pruning: <Scissors className="size-4" />,
  inspection: <Search className="size-4" />,
  alert: <TriangleAlert className="size-4" />,
}

const STATUS_LABEL: Record<FarmEventStatus, string> = {
  pending: "Pendiente",
  in_progress: "En curso",
  completed: "Completado",
  skipped: "Omitido",
}

const PRIORITY_LABEL: Record<FarmEventPriority, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
  critical: "Critica",
}

const springConfig: Transition = { type: "spring", bounce: 0, duration: 0.6 }
const opacityConfig: Transition = { duration: 0.4, ease: [0.19, 1, 0.22, 1] }

export function EventList({ events }: { events: FarmEvent[] }) {
  const [open, setOpen] = useState<string | null>(null)
  const isOpen = open === null
  const [ref, bounds] = useMeasure()
  const selected = events.find((event) => event.id === open) ?? null

  return (
    <MotionConfig transition={springConfig}>
      <motion.div
        className="flex w-full items-start justify-start overflow-hidden"
        animate={{ height: bounds.height > 0 ? bounds.height : "auto" }}
      >
        <div className="w-full" ref={ref}>
          <AnimatePresence mode="popLayout">
            {isOpen ? (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={opacityConfig}
                className="flex w-full flex-col gap-2"
              >
                {events.map((item) => (
                  <EventItem
                    key={item.id}
                    data={item}
                    onClick={() => setOpen(item.id)}
                  />
                ))}
              </motion.div>
            ) : (
              selected && (
                <motion.div exit={{ opacity: 0 }} className="w-full">
                  <EventItemExpanded
                    data={selected}
                    onClose={() => setOpen(null)}
                  />
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </MotionConfig>
  )
}

function EventItem({
  data,
  onClick,
}: {
  data: FarmEvent
  onClick: () => void
}) {
  const categoryLabel = data.crop
    ? `${data.category} / ${data.crop}`
    : data.category
  const priorityLabel = PRIORITY_LABEL[data.priority]

  return (
    <div className="flex w-full cursor-pointer gap-2" onClick={onClick}>
      <motion.div
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted"
        layoutId={`icon-${data.id}`}
      >
        {TYPE_ICON[data.type]}
      </motion.div>

      <div className="flex flex-1 flex-col justify-center text-xs">
        <motion.p
          className="font-semibold text-foreground"
          layoutId={`name-${data.id}`}
        >
          {data.title}
        </motion.p>
        <motion.p
          className="text-muted-foreground"
          layoutId={`category-${data.id}`}
        >
          {categoryLabel}
        </motion.p>
      </div>

      <motion.p
        className="flex items-center text-xs text-muted-foreground"
        layoutId={`priority-${data.id}`}
      >
        {priorityLabel}
      </motion.p>
    </div>
  )
}

function EventItemExpanded({
  data,
  onClose,
}: {
  data: FarmEvent
  onClose: () => void
}) {
  const startDate = new Date(data.startAt)
  const categoryLabel = data.crop
    ? `${data.category} / ${data.crop}`
    : data.category
  const priorityLabel = PRIORITY_LABEL[data.priority]
  const statusLabel = STATUS_LABEL[data.status]
  const dateLabel = startDate.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  const timeLabel = data.allDay
    ? "Todo el dia"
    : startDate.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      })

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex justify-between">
        <motion.div
          className="flex size-10 items-center justify-center rounded-md bg-muted"
          layoutId={`icon-${data.id}`}
        >
          {TYPE_ICON[data.type]}
        </motion.div>
        <div
          className="flex cursor-pointer items-center justify-center self-start rounded-full bg-muted p-2"
          onClick={onClose}
        >
          <X className="size-4" />
        </div>
      </div>

      <div className="flex justify-between">
        <div>
          <motion.p
            className="font-semibold text-foreground"
            layoutId={`name-${data.id}`}
          >
            {data.title}
          </motion.p>
          <motion.p
            className="text-sm text-muted-foreground"
            layoutId={`category-${data.id}`}
          >
            {categoryLabel}
          </motion.p>
        </div>
        <motion.p layoutId={`priority-${data.id}`} className="text-foreground">
          {priorityLabel}
        </motion.p>
      </div>

      <motion.div
        className="flex flex-col gap-2 text-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ ...opacityConfig, delay: 0.1 }}
      >
        <div className="border border-dashed border-border" />
        <p className="text-muted-foreground">#{data.id}</p>
        <p className="text-muted-foreground">{dateLabel}</p>
        <p className="text-muted-foreground">{timeLabel}</p>
        <div className="border border-dashed border-border" />
        <p className="text-muted-foreground">Estado: {statusLabel}</p>
        <p className="text-muted-foreground">
          Parcela: {data.parcelId}{" "}
          <span className="font-bold text-foreground uppercase italic">
            {priorityLabel}
          </span>
        </p>
      </motion.div>
    </div>
  )
}
