"use client"

import type {
  ActionConfirmationData,
  ActionConfirmationStatus,
} from "@workspace/copilot"
import type {
  CopilotActionPayload,
  CopilotActionType,
  CreateTaskPayload,
  TaskCategory,
} from "@workspace/copilot"
import {
  formatActionDate,
  getActionUiConfig,
  TASK_CATEGORY_LABELS,
} from "@workspace/copilot"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { cn } from "@workspace/ui/lib/utils"

interface ActionConfirmationCardProps {
  confirmation: ActionConfirmationData
  editedData: CopilotActionPayload
  status: ActionConfirmationStatus
  onDataChange: (data: CopilotActionPayload) => void
  onConfirm: () => void
  onCancel: () => void
  disabled?: boolean
}

const STATUS_LABELS: Record<ActionConfirmationStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
}

function StatusBadge({ status }: { status: ActionConfirmationStatus }) {
  return (
    <Badge
      variant={status === "confirmed" ? "default" : "secondary"}
      className={cn(
        status === "cancelled" && "bg-muted text-muted-foreground",
        status === "confirmed" && "bg-emerald-600/90 text-white"
      )}
    >
      {STATUS_LABELS[status]}
    </Badge>
  )
}

function CreateTaskFields({
  data,
  disabled,
  onChange,
}: {
  data: CreateTaskPayload
  disabled: boolean
  onChange: (data: CreateTaskPayload) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="space-y-1.5">
        <label
          className="text-xs font-medium text-muted-foreground"
          htmlFor="task-title"
        >
          Título
        </label>
        <Input
          id="task-title"
          value={data.title}
          disabled={disabled}
          onChange={(event) => onChange({ ...data, title: event.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <label
          className="text-xs font-medium text-muted-foreground"
          htmlFor="task-date"
        >
          Fecha
        </label>
        <Input
          id="task-date"
          type="date"
          value={data.date}
          disabled={disabled}
          onChange={(event) => onChange({ ...data, date: event.target.value })}
        />
        {data.date ? (
          <p className="text-xs text-muted-foreground capitalize">
            {formatActionDate(data.date)}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label
          className="text-xs font-medium text-muted-foreground"
          htmlFor="task-category"
        >
          Categoría
        </label>
        <select
          id="task-category"
          value={data.category ?? ""}
          disabled={disabled}
          onChange={(event) => {
            const value = event.target.value
            onChange({
              ...data,
              category: value ? (value as TaskCategory) : undefined,
            })
          }}
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Sin categoría</option>
          {(
            Object.entries(TASK_CATEGORY_LABELS) as [TaskCategory, string][]
          ).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label
          className="text-xs font-medium text-muted-foreground"
          htmlFor="task-description"
        >
          Descripción
        </label>
        <Textarea
          id="task-description"
          value={data.description ?? ""}
          disabled={disabled}
          rows={2}
          onChange={(event) =>
            onChange({
              ...data,
              description: event.target.value || undefined,
            })
          }
        />
      </div>
    </div>
  )
}

function ActionFields({
  action,
  data,
  disabled,
  onDataChange,
}: {
  action: CopilotActionType
  data: CopilotActionPayload
  disabled: boolean
  onDataChange: (data: CopilotActionPayload) => void
}) {
  if (action === "create_task") {
    return (
      <CreateTaskFields
        data={data as CreateTaskPayload}
        disabled={disabled}
        onChange={onDataChange}
      />
    )
  }

  return null
}

export function ActionConfirmationCard({
  confirmation,
  editedData,
  status,
  onDataChange,
  onConfirm,
  onCancel,
  disabled = false,
}: ActionConfirmationCardProps) {
  const uiConfig = getActionUiConfig(confirmation.action)
  const isPending = status === "pending"
  const fieldsDisabled = disabled || !isPending

  return (
    <Card size="sm" className="w-full max-w-[90%]">
      <CardHeader className="flex flex-row items-center justify-between gap-2 border-b">
        <CardTitle>{uiConfig.title}</CardTitle>
        {!isPending ? <StatusBadge status={status} /> : null}
      </CardHeader>

      <CardContent>
        <ActionFields
          action={confirmation.action}
          data={editedData}
          disabled={fieldsDisabled}
          onDataChange={onDataChange}
        />
      </CardContent>

      {isPending ? (
        <CardFooter className="justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={disabled}
            onClick={onCancel}
          >
            {uiConfig.cancelLabel}
          </Button>
          <Button type="button" disabled={disabled} onClick={onConfirm}>
            {uiConfig.confirmLabel}
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  )
}
