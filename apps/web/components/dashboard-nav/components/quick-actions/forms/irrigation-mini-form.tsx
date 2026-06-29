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

const irrigationSchema = z.object({
  parcelId: z.string().min(1),
  date: z.string().min(1),
  volumeLiters: z.coerce.number().positive(),
  irrigationType: z.enum(["goteo", "aspersion", "gravedad"]),
})

type IrrigationValues = z.infer<typeof irrigationSchema>

export function IrrigationMiniForm({ onSuccess }: MiniFormProps) {
  const form = useForm<IrrigationValues>({
    resolver: zodResolver(irrigationSchema),
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      irrigationType: "goteo",
    },
  })
  const [loading, setLoading] = React.useState(false)

  async function onSubmit(values: IrrigationValues) {
    setLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 700))
      console.log("Riego:", values)
      onSuccess()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <MiniFormShell submitLabel="Guardar riego" loading={loading}>
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
              name="volumeLiters"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">L/ha</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      className="h-7 text-xs"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="irrigationType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Sistema</FormLabel>
                <FormControl>
                  <ToggleGroup
                    type="single"
                    value={field.value}
                    onValueChange={(v) => v && field.onChange(v)}
                    className="grid grid-cols-3"
                  >
                    <ToggleGroupItem value="goteo" className="h-7 text-xs">
                      Goteo
                    </ToggleGroupItem>
                    <ToggleGroupItem value="aspersion" className="h-7 text-xs">
                      Aspersión
                    </ToggleGroupItem>
                    <ToggleGroupItem value="gravedad" className="h-7 text-xs">
                      Gravedad
                    </ToggleGroupItem>
                  </ToggleGroup>
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
