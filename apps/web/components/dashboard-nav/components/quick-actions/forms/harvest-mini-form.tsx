"use client"

import * as React from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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

import { MiniFormShell } from "@workspace/web/components/dashboard-nav/components/quick-actions/forms/mini-form-shell"
import type { MiniFormProps } from "@workspace/web/components/dashboard-nav/components/quick-actions/forms/mini-form-types"
import { useDefaultParcelId } from "@workspace/web/components/dashboard-nav/components/quick-actions/forms/use-default-parcel-id"
import { useParcels } from "@workspace/web/hooks/parcel"
import { useCreateHarvestDelivery } from "@workspace/web/hooks/production"
import { harvestDeliveryCreateSchema } from "@workspace/schemas"
import { toast } from "sonner"
import type { HarvestDeliveryCreateInput } from "@workspace/schemas"

const RAW_UNITS = ["kg", "t", "caja"]
const PROCESSED_UNITS = ["l", "kg", "botella"]

type HarvestMiniFormProps = MiniFormProps & {
  parcelId?: string
}

export function HarvestMiniForm({ onSuccess, parcelId }: HarvestMiniFormProps) {
  const defaultParcelId = useDefaultParcelId()
  const resolvedParcelId = parcelId ?? defaultParcelId
  const { data: parcels, isLoading: isLoadingParcels } = useParcels()
  const { mutate: createHarvestDelivery, isPending } =
    useCreateHarvestDelivery()

  const form = useForm({
    resolver: zodResolver(harvestDeliveryCreateSchema),
    defaultValues: {
      parcelId: resolvedParcelId ?? "",
      deliveryDate: new Date().toISOString().slice(0, 10),
      destinationName: "",
      rawQuantity: 0,
      rawUnit: "kg",
      conversionRate: null,
      processedUnit: "l",
      grade: "",
      targetSalePricePerUnit: null,
      notes: "",
    },
  })

  const conversionRate = useWatch({
    control: form.control,
    name: "conversionRate",
  })
  const hasConversion =
    conversionRate !== null &&
    conversionRate !== undefined &&
    conversionRate > 0

  function onSubmit(values: HarvestDeliveryCreateInput) {
    createHarvestDelivery(values, {
      onSuccess: () => {
        toast.success("Entrega registrada")
        onSuccess()
      },
      onError: (error) => {
        toast.error(error.message || "Error al registrar la entrega")
      },
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <MiniFormShell
          submitLabel="Guardar entrega"
          loading={isPending || isLoadingParcels}
        >
          <FormField
            control={form.control}
            name="parcelId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Parcela</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue placeholder="Selecciona parcela" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {parcels?.map((p) => (
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
              name="deliveryDate"
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
              name="destinationName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Destino</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Cooperativa, almacén..."
                      className="h-7 text-xs"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <FormField
              control={form.control}
              name="rawQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Cantidad bruta</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0"
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
              name="rawUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Unidad bruta</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {RAW_UNITS.map((u) => (
                        <SelectItem key={u} value={u} className="text-xs">
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <FormField
              control={form.control}
              name="conversionRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Rendimiento (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Sin conversión"
                      className="h-7 text-xs"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const value = e.target.value
                        field.onChange(value === "" ? null : Number(value))
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {hasConversion && (
              <FormField
                control={form.control}
                name="processedUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Unidad procesada</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PROCESSED_UNITS.map((u) => (
                          <SelectItem key={u} value={u} className="text-xs">
                            {u}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <FormField
              control={form.control}
              name="grade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Calidad / Grado</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Virgen extra..."
                      className="h-7 text-xs"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="targetSalePricePerUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">
                    Precio objetivo (€/u)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.0001"
                      placeholder="Opcional"
                      className="h-7 text-xs"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const value = e.target.value
                        field.onChange(value === "" ? null : Number(value))
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Notas</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Observaciones..."
                    className="min-h-[60px] resize-none text-xs"
                    {...field}
                    value={field.value ?? ""}
                  />
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
