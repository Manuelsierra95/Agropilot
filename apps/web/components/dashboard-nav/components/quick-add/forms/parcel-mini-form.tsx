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
import { CROPS } from "./mini-form-data"
import type { MiniFormProps } from "./mini-form-types"

const parcelSchema = z.object({
  name: z.string().min(1),
  crop: z.string().min(1),
  surface: z.coerce.number().positive(),
  municipality: z.string().min(1),
})

type ParcelValues = z.infer<typeof parcelSchema>

export function ParcelMiniForm({ onSuccess }: MiniFormProps) {
  const form = useForm<ParcelValues>({ resolver: zodResolver(parcelSchema) })
  const [loading, setLoading] = React.useState(false)

  async function onSubmit(values: ParcelValues) {
    setLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 700))
      console.log("Parcela:", values)
      onSuccess()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <MiniFormShell submitLabel="Crear parcela" loading={loading}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Nombre</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Parcela Norte"
                    className="h-7 text-xs"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-2">
            <FormField
              control={form.control}
              name="crop"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Cultivo</FormLabel>
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
                      {CROPS.map((c) => (
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
            <FormField
              control={form.control}
              name="surface"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Superficie (ha)</FormLabel>
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
          </div>

          <FormField
            control={form.control}
            name="municipality"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Municipio</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Torreperogil…"
                    className="h-7 text-xs"
                    {...field}
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
