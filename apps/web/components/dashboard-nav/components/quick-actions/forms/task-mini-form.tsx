"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import {
  TASK_CATEGORY_LABELS,
  taskCategorySchema,
  type TaskCategory,
} from "@workspace/schemas"
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

import { MiniFormShell } from "@workspace/web/components/dashboard-nav/components/quick-actions/forms/mini-form-shell"
import { useParcels } from "@workspace/web/hooks/parcel"
import { api } from "@workspace/web/lib/api"
import type { MiniFormProps } from "@workspace/web/components/dashboard-nav/components/quick-actions/forms/mini-form-types"

const taskSchema = z.object({
  title: z.string().min(1),
  category: z.string().min(1),
  parcelId: z.string().min(1),
  dueDate: z.string().min(1),
})

type TaskValues = z.infer<typeof taskSchema>

export function TaskMiniForm({ onSuccess }: MiniFormProps) {
  const { data: parcels = [], isLoading: loadingParcels } = useParcels()
  const form = useForm<TaskValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      category: "inspection",
      dueDate: new Date().toISOString().slice(0, 10),
    },
  })
  const [loading, setLoading] = React.useState(false)

  async function onSubmit(values: TaskValues) {
    setLoading(true)
    try {
      await api.tasks.createTask({
        title: values.title,
        category: values.category as TaskCategory,
        startDate: values.dueDate,
        parcelId: values.parcelId === "all" ? undefined : values.parcelId,
      })
      toast.success("Tarea creada")
      onSuccess()
    } catch {
      toast.error("Error al crear la tarea")
    } finally {
      setLoading(false)
    }
  }

  const categories = taskCategorySchema.options

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <MiniFormShell submitLabel="Añadir tarea" loading={loading}>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Tarea</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Descripción breve…"
                    className="h-7 text-xs"
                    {...field}
                  />
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
                <FormLabel className="text-xs">Categoría</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-xs">
                        {TASK_CATEGORY_LABELS[cat]}
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
            name="parcelId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Parcela</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue
                        placeholder={
                          loadingParcels ? "Cargando…" : "Selecciona"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">
                      Todas las parcelas
                    </SelectItem>
                    {parcels.map((p) => (
                      <SelectItem key={p.id} value={p.id} className="text-xs">
                        {p.name}
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
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Fecha límite</FormLabel>
                <FormControl>
                  <Input type="date" className="h-7 text-xs" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </MiniFormShell>
      </form>
    </Form>
  )
}
