"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { format } from "date-fns"
import { z } from "zod"

import {
  TASK_STATUS_LABELS,
  taskStatusSchema,
  type TaskSelect,
  type TaskUpdateInput,
} from "@workspace/schemas"
import { Button } from "@workspace/ui/components/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@workspace/ui/components/drawer"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog"
import { useIsMobile } from "@workspace/ui/hooks/use-mobile"
import { Badge } from "@workspace/ui/components/badge"
import { CategorySelector } from "@workspace/web/components/tasks/category-selector"
import { useParcels } from "@workspace/web/hooks/parcel"
import { api } from "@workspace/web/lib/api"

const editTaskSchema = z.object({
  title: z.string().min(1),
  category: z.string().min(1),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
  parcelId: z.string().nullable(),
  priority: z.number().int().min(0).max(3),
  status: taskStatusSchema,
  description: z.string().nullable(),
})

type EditTaskValues = z.infer<typeof editTaskSchema>

const PRIORITY_OPTIONS = [
  { value: 0, label: "Ninguna" },
  { value: 1, label: "Baja" },
  { value: 2, label: "Media" },
  { value: 3, label: "Alta" },
] as const

interface TaskDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskId: string | null
}

function formatDateInput(date: Date | null): string {
  if (!date) return ""
  return format(date, "yyyy-MM-dd")
}

export function TaskDetailSheet({
  open,
  onOpenChange,
  taskId,
}: TaskDetailSheetProps) {
  const isMobile = useIsMobile()
  const { data: parcels = [], isLoading: loadingParcels } = useParcels()
  const [task, setTask] = React.useState<TaskSelect | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)

  const form = useForm<EditTaskValues>({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {
      title: "",
      category: "",
      startDate: "",
      endDate: null,
      parcelId: null,
      priority: 0,
      status: "pending",
      description: null,
    },
  })

  React.useEffect(() => {
    if (open && taskId) {
      setIsLoading(true)
      api.tasks
        .getTask(taskId)
        .then((data) => {
          setTask(data)
          form.reset({
            title: data.title,
            category: data.category,
            startDate: formatDateInput(data.startDate),
            endDate: formatDateInput(data.endDate),
            parcelId: data.parcelId,
            priority: data.priority,
            status: data.status,
            description: data.description,
          })
          setIsEditing(false)
        })
        .catch(() => {
          toast.error("No se pudo cargar la tarea")
          onOpenChange(false)
        })
        .finally(() => setIsLoading(false))
    }

    if (!open) {
      setTask(null)
      setIsEditing(false)
      form.reset()
    }
  }, [open, taskId, form, onOpenChange])

  async function handleSubmit(values: EditTaskValues) {
    if (!taskId) return

    setIsSubmitting(true)
    try {
      const payload: TaskUpdateInput = {
        title: values.title,
        category: values.category,
        startDate: values.startDate,
        endDate: values.endDate,
        parcelId: values.parcelId || null,
        priority: values.priority,
        status: values.status,
        description: values.description,
      }

      await api.tasks.updateTask(taskId, payload)
      toast.success("Tarea actualizada correctamente")
      setIsEditing(false)
      onOpenChange(false)
    } catch {
      toast.error("No se pudo actualizar la tarea")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!taskId) return

    setIsDeleting(true)
    try {
      await api.tasks.deleteTask(taskId)
      toast.success("Tarea eliminada correctamente")
      onOpenChange(false)
    } catch {
      toast.error("No se pudo eliminar la tarea")
    } finally {
      setIsDeleting(false)
    }
  }

  function handleClose() {
    onOpenChange(false)
  }

  const parcelName = React.useMemo(() => {
    if (!task) return "—"
    if (!task.parcelId) return "Sin parcela"
    return parcels.find((p) => p.id === task.parcelId)?.name ?? "—"
  }, [task, parcels])

  const formContent = (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Riego parcela norte" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría</FormLabel>
              <FormControl>
                <CategorySelector
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de inicio</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de fin (opcional)</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value || null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {taskStatusSchema.options.map((status) => (
                      <SelectItem key={status} value={status}>
                        {TASK_STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prioridad</FormLabel>
                <FormControl>
                  <div className="grid grid-cols-4 gap-1">
                    {PRIORITY_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => field.onChange(option.value)}
                        className={`h-8 rounded-md border text-xs font-medium transition-colors ${
                          field.value === option.value
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-card text-muted-foreground hover:bg-accent"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="parcelId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parcela</FormLabel>
              <Select
                onValueChange={(value) =>
                  field.onChange(value === "none" ? null : value)
                }
                value={field.value || "none"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        loadingParcels ? "Cargando…" : "Seleccionar (opcional)"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Sin parcela</SelectItem>
                  {parcels.map((parcel) => (
                    <SelectItem key={parcel.id} value={parcel.id}>
                      {parcel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detalles adicionales…"
                  rows={3}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => setIsEditing(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? "Guardando…" : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </Form>
  )

  const viewContent = task && (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{task.title}</h3>
          <p className="text-sm text-muted-foreground">{parcelName}</p>
        </div>
        <Badge variant="secondary">{TASK_STATUS_LABELS[task.status]}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Categoría</p>
          <p className="font-medium capitalize">{task.category}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Prioridad</p>
          <p className="font-medium">
            {PRIORITY_OPTIONS.find((o) => o.value === task.priority)?.label ??
              "Ninguna"}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Inicio</p>
          <p className="font-medium">{formatDateInput(task.startDate)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Fin</p>
          <p className="font-medium">{formatDateInput(task.endDate) || "—"}</p>
        </div>
      </div>

      {task.description ? (
        <div>
          <p className="text-sm text-muted-foreground">Descripción</p>
          <p className="text-sm whitespace-pre-wrap">{task.description}</p>
        </div>
      ) : null}

      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => setIsEditing(true)}
        >
          Editar
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="destructive"
              className="flex-1"
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando…" : "Eliminar"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar tarea</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro de que quieres eliminar esta tarea? Esta acción no
                se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )

  const content = isLoading ? (
    <div className="py-8 text-center text-sm text-muted-foreground">
      Cargando tarea…
    </div>
  ) : isEditing ? (
    formContent
  ) : (
    viewContent
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
        <DrawerContent className="min-h-[85vh]">
          <DrawerHeader className="gap-1 text-left">
            <DrawerTitle>Detalle de tarea</DrawerTitle>
            <DrawerDescription>
              Consulta, edita o elimina la tarea.
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto px-4 pb-4">{content}</div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Cerrar</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="min-w-fit sm:max-w-md">
        <SheetHeader className="gap-1 text-left">
          <SheetTitle>Detalle de tarea</SheetTitle>
          <SheetDescription>
            Consulta, edita o elimina la tarea.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 py-4">{content}</div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cerrar</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
