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
import { useDefaultParcelId } from "@workspace/web/components/dashboard-nav/components/quick-actions/forms/use-default-parcel-id"
import { INCOME_CONCEPTS } from "@workspace/web/components/dashboard-nav/components/quick-actions/forms/mini-form-data"
import { useParcels } from "@workspace/web/hooks/parcel"
import { api } from "@workspace/web/lib/api"
import type { MiniFormProps } from "@workspace/web/components/dashboard-nav/components/quick-actions/forms/mini-form-types"

const incomeSchema = z.object({
  parcelId: z.string().min(1),
  concept: z.string().min(1),
  amount: z.coerce.number().positive(),
  date: z.string().min(1),
})

type IncomeValues = z.infer<typeof incomeSchema>

const CONCEPT_MAP: Record<string, string> = {
  "Venta cosecha": "sale",
  "Subvención PAC": "subsidy",
  Arrendamiento: "other",
  Otro: "other",
}

export function IncomeMiniForm({ onSuccess }: MiniFormProps) {
  const defaultParcelId = useDefaultParcelId()
  const { data: parcels = [], isLoading: loadingParcels } = useParcels()
  const form = useForm<IncomeValues>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      parcelId: defaultParcelId,
    },
  })
  const [loading, setLoading] = React.useState(false)

  async function onSubmit(values: IncomeValues) {
    setLoading(true)
    try {
      await api.finance.createTransaction({
        concept: values.concept,
        flow: "income",
        category: (CONCEPT_MAP[values.concept] ??
          "other") as TransactionCategory,
        amount: values.amount,
        date: values.date,
        parcelId: values.parcelId === "all" ? undefined : values.parcelId,
      })
      toast.success("Ingreso registrado")
      onSuccess()
    } catch {
      toast.error("Error al registrar el ingreso")
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
                <Select onValueChange={field.onChange} value={field.value}>
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
