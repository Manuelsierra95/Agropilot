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
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group"

import { MiniFormShell } from "@workspace/web/components/dashboard-nav/components/quick-actions/forms/mini-form-shell"
import { PARCELS } from "@workspace/web/components/dashboard-nav/components/quick-actions/forms/mini-form-data"
import type { MiniFormProps } from "@workspace/web/components/dashboard-nav/components/quick-actions/forms/mini-form-types"

const treatmentSchema = z.object({
  parcelId: z.string().min(1),
  date: z.string().min(1),
  product: z.string().min(1),
  type: z.enum(["fitosanitario", "abono", "otro"]),
})

type TreatmentValues = z.infer<typeof treatmentSchema>

export function TreatmentMiniForm({ onSuccess }: MiniFormProps) {
  const form = useForm<TreatmentValues>({
    resolver: zodResolver(treatmentSchema),
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      type: "fitosanitario",
    },
  })
  const [loading, setLoading] = React.useState(false)

  async function onSubmit(values: TreatmentValues) {
    setLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 700))
      console.log("Tratamiento:", values)
      onSuccess()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <MiniFormShell submitLabel="Guardar tratamiento" loading={loading}>
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
                    {PARCELS.map((p) => (
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
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Tipo</FormLabel>
                <FormControl>
                  <ToggleGroup
                    type="single"
                    value={field.value}
                    onValueChange={(v) => v && field.onChange(v)}
                    className="grid grid-cols-3"
                  >
                    <ToggleGroupItem
                      value="fitosanitario"
                      className="h-7 text-[11px]"
                    >
                      Fitosani.
                    </ToggleGroupItem>
                    <ToggleGroupItem value="abono" className="h-7 text-[11px]">
                      Abono
                    </ToggleGroupItem>
                    <ToggleGroupItem value="otro" className="h-7 text-[11px]">
                      Otro
                    </ToggleGroupItem>
                  </ToggleGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-2">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Fecha</FormLabel>
                  <FormControl>
                    <Input type="date" className="h-7 text-xs" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="product"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Producto</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nombre"
                      className="h-7 text-xs"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </MiniFormShell>
      </form>
    </Form>
  )
}
