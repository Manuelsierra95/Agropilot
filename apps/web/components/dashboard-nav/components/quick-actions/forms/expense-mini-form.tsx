"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { type TransactionCategory } from "@workspace/schemas"
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
import { EXPENSE_CATEGORIES } from "@workspace/web/components/dashboard-nav/components/quick-actions/forms/mini-form-data"
import { useParcels } from "@workspace/web/hooks/parcel"
import { api } from "@workspace/web/lib/api"
import type { MiniFormProps } from "@workspace/web/components/dashboard-nav/components/quick-actions/forms/mini-form-types"

const expenseSchema = z.object({
  parcelId: z.string().min(1),
  category: z.string().min(1),
  amount: z.coerce.number().positive(),
  date: z.string().min(1),
})

type ExpenseValues = z.infer<typeof expenseSchema>

const CATEGORY_MAP: Record<string, string> = {
  "Semillas / Plantones": "fertilization",
  Fertilizantes: "fertilization",
  Fitosanitarios: "treatment",
  Combustible: "fuel",
  "Maquinaria / Alquiler": "machinery",
  "Mano de obra": "labor",
  Otro: "other",
}

export function ExpenseMiniForm({ onSuccess }: MiniFormProps) {
  const { data: parcels = [], isLoading: loadingParcels } = useParcels()
  const form = useForm<ExpenseValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { date: new Date().toISOString().slice(0, 10) },
  })
  const [loading, setLoading] = React.useState(false)

  async function onSubmit(values: ExpenseValues) {
    setLoading(true)
    try {
      await api.finance.createTransaction({
        concept: values.category,
        flow: "expense",
        category: (CATEGORY_MAP[values.category] ?? "other") as TransactionCategory,
        amount: values.amount,
        date: values.date,
        parcelId: values.parcelId === "all" ? undefined : values.parcelId,
      })
      toast.success("Gasto registrado")
      onSuccess()
    } catch {
      toast.error("Error al registrar el gasto")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <MiniFormShell submitLabel="Registrar gasto" loading={loading}>
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
                    {EXPENSE_CATEGORIES.map((c) => (
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
