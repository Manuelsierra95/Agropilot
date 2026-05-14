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
import { INCOME_CONCEPTS, PARCELS_WITH_ALL } from "./mini-form-data"
import type { MiniFormProps } from "./mini-form-types"

const incomeSchema = z.object({
  parcelId: z.string().min(1),
  concept: z.string().min(1),
  amount: z.coerce.number().positive(),
  date: z.string().min(1),
})

type IncomeValues = z.infer<typeof incomeSchema>

export function IncomeMiniForm({ onSuccess }: MiniFormProps) {
  const form = useForm<IncomeValues>({
    resolver: zodResolver(incomeSchema),
    defaultValues: { date: new Date().toISOString().slice(0, 10) },
  })
  const [loading, setLoading] = React.useState(false)

  async function onSubmit(values: IncomeValues) {
    setLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 700))
      console.log("Ingreso:", values)
      onSuccess()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <MiniFormShell submitLabel="Registrar ingreso" loading={loading}>
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
            name="concept"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Concepto</FormLabel>
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
                    {INCOME_CONCEPTS.map((c) => (
                      <SelectItem key={c} value={c} className="text-xs">
                        {c}
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
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Importe (€)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0,00"
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
          </div>
        </MiniFormShell>
      </form>
    </Form>
  )
}
