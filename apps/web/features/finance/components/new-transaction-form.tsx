"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { type TransactionCategory } from "@workspace/schemas"
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
import { useParcels } from "@workspace/web/hooks/parcel"
import { api } from "@workspace/web/lib/api"

const formSchema = z.object({
  concept: z.string().min(1, "El concepto es obligatorio"),
  flow: z.enum(["income", "expense"]),
  category: z.string().min(1, "La categoría es obligatoria"),
  amount: z.coerce.number().positive("El importe debe ser mayor a 0"),
  date: z.string().min(1, "La fecha es obligatoria"),
  parcelId: z.string().optional(),
  paymentMethod: z.string().optional(),
  invoiceNumber: z.string().optional(),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

const EXPENSE_CATEGORIES: { label: string; value: TransactionCategory }[] = [
  { label: "Riego", value: "irrigation" },
  { label: "Fertilización", value: "fertilization" },
  { label: "Tratamiento", value: "treatment" },
  { label: "Mano de obra", value: "labor" },
  { label: "Maquinaria", value: "machinery" },
  { label: "Combustible", value: "fuel" },
  { label: "Cosecha", value: "harvest" },
  { label: "Otros", value: "other" },
]

const INCOME_CATEGORIES: { label: string; value: TransactionCategory }[] = [
  { label: "Venta de cosecha", value: "sale" },
  { label: "Subvenciones", value: "subsidy" },
  { label: "Otros", value: "other" },
]

export function NewTransactionForm({ onSuccess }: { onSuccess: () => void }) {
  const { data: parcels = [], isLoading: loadingParcels } = useParcels()
  const [loading, setLoading] = React.useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      flow: "expense",
      date: new Date().toISOString().slice(0, 10),
    },
  })

  const watchedFlow = form.watch("flow")
  const categories =
    watchedFlow === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES

  async function onSubmit(values: FormValues) {
    setLoading(true)
    try {
      await api.finance.createTransaction({
        concept: values.concept,
        flow: values.flow,
        category: values.category as TransactionCategory,
        amount: values.amount,
        date: values.date,
        parcelId: values.parcelId || undefined,
        paymentMethod: values.paymentMethod as
          | "transferencia"
          | "tarjeta"
          | "efectivo"
          | "cheque"
          | "otro"
          | undefined,
        invoiceNumber: values.invoiceNumber || undefined,
        description: values.description || undefined,
      })
      toast.success("Transacción registrada")
      form.reset({
        flow: watchedFlow,
        date: new Date().toISOString().slice(0, 10),
      })
      onSuccess()
    } catch {
      toast.error("Error al registrar la transacción")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="concept"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Concepto</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Fertilización parcela norte"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="flow"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="expense">Gasto</SelectItem>
                    <SelectItem value="income">Ingreso</SelectItem>
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
                <FormLabel>Categoría</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Importe (€)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="0,00"
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
                <FormLabel>Fecha</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  {parcels.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Método de pago</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                    <SelectItem value="tarjeta">Tarjeta</SelectItem>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="invoiceNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nº Factura</FormLabel>
                <FormControl>
                  <Input placeholder="Opcional" {...field} />
                </FormControl>
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
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Notas adicionales…"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Guardando…" : "Guardar transacción"}
        </Button>
      </form>
    </Form>
  )
}
