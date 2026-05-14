"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
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

import { MiniFormShell } from "./mini-form-shell"
import { PARCELS_WITH_ALL } from "./mini-form-data"
import type { MiniFormProps } from "./mini-form-types"

const taskSchema = z.object({
  title: z.string().min(1),
  parcelId: z.string().min(1),
  dueDate: z.string().min(1),
})

type TaskValues = z.infer<typeof taskSchema>

export function TaskMiniForm({ onSuccess }: MiniFormProps) {
  const form = useForm<TaskValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: { dueDate: new Date().toISOString().slice(0, 10) },
  })
  const [loading, setLoading] = React.useState(false)

  async function onSubmit(values: TaskValues) {
    setLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 700))
      console.log("Tarea:", values)
      onSuccess()
    } finally {
      setLoading(false)
    }
  }

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
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PARCELS_WITH_ALL.map((p) => (
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
