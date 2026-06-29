"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  TASK_CATEGORY_LABELS,
  taskCategorySchema,
  taskCreateInputSchema,
  type TaskCreateInput,
} from "@workspace/schemas"
import { Button } from "@workspace/ui/components/button"
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
import { useState } from "react"
import { useForm } from "react-hook-form"

import { api } from "@workspace/web/lib/api"

const taskFormSchema = taskCreateInputSchema

type TaskFormValues = TaskCreateInput

export interface TaskFormCardProps {
  defaults: TaskCreateInput
  onSuccess: (title: string) => void
  onError: () => void
}

export function TaskFormCard({ defaults, onSuccess, onError }: TaskFormCardProps) {
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: defaults,
  })

  async function handleSubmit(values: TaskFormValues) {
    setSubmitting(true)
    try {
      const task = await api.tasks.createTask(values)
      onSuccess(task.title)
    } catch {
      onError()
    } finally {
      setSubmitting(false)
    }
  }

  const categories = taskCategorySchema.options

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-3 rounded-lg border bg-card p-4"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Descripción de la tarea" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
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
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona categoría" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {TASK_CATEGORY_LABELS[category]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detalles adicionales…"
                  className="min-h-16 resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={submitting} className="self-start">
          {submitting ? "Creando…" : "Crear tarea"}
        </Button>
      </form>
    </Form>
  )
}
