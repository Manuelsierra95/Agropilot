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

import { MiniFormShell } from "@workspace/web/components/dashboard-nav/components/quick-actions/forms/mini-form-shell"
import { DESTINATIONS, PARCELS } from "@workspace/web/components/dashboard-nav/components/quick-actions/forms/mini-form-data"
import type { MiniFormProps } from "@workspace/web/components/dashboard-nav/components/quick-actions/forms/mini-form-types"

const harvestSchema = z.object({
  parcelId: z.string().min(1),
  date: z.string().min(1),
  kg: z.coerce.number().positive(),
  destination: z.string().min(1),
})

type HarvestValues = z.infer<typeof harvestSchema>

export function HarvestMiniForm({ onSuccess }: MiniFormProps) {
  const form = useForm<HarvestValues>({
    resolver: zodResolver(harvestSchema),
    defaultValues: { date: new Date().toISOString().slice(0, 10) },
  })
  const [loading, setLoading] = React.useState(false)

  async function onSubmit(values: HarvestValues) {
    setLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 700))
      console.log("Cosecha:", values)
      onSuccess()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <MiniFormShell submitLabel="Guardar cosecha" loading={loading}>
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
              name="kg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Kg recogidos</FormLabel>
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
            name="destination"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Destino</FormLabel>
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
                    {DESTINATIONS.map((d) => (
                      <SelectItem key={d} value={d} className="text-xs">
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </MiniFormShell>
      </form>
    </Form>
  )
}
