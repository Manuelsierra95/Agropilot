"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useIsMobile } from "@workspace/ui/hooks/use-mobile"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@workspace/ui/components/drawer"
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
import { Button } from "@workspace/ui/components/button"
import { CropTypeSelector } from "@workspace/web/features/onboarding/components/parcel/crop-type-selector"
import { ParcelSearch } from "@workspace/web/features/onboarding/components/parcel/parcel-search/parcel-search"
import { searchParcel } from "@workspace/web/lib/cadastre/search-parcel"
import type { ParcelSearchResult } from "@workspace/web/features/onboarding/components/parcel/parcel-search/types"
import type { ParcelAddress } from "@workspace/web/lib/cadastre/types"
import {
  DEFAULT_CROP_TYPE,
  type CropTypeValue,
  type IrrigationType,
} from "@workspace/web/features/onboarding/components/parcel/parcel-constants"
import { useUpdateParcel } from "@workspace/web/hooks/parcel/use-update-parcel"
import type { ParcelItem, ParcelApiResponse } from "@workspace/web/lib/parcel/types"
import { parcelUpdateInputSchema } from "@workspace/schemas"

const formSchema = parcelUpdateInputSchema

type FormValues = z.infer<typeof formSchema>

interface EditParcelSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  parcel: ParcelItem
  apiResponse?: ParcelApiResponse
}

export function EditParcelSheet({
  open,
  onOpenChange,
  parcel,
  apiResponse,
}: EditParcelSheetProps) {
  const isMobile = useIsMobile()
  const updateParcel = useUpdateParcel()
  const [geometryState, setGeometryState] = React.useState<{
    centroid?: string | null
    polygon?: string | null
    refcat?: string | null
    address?: ParcelAddress | null
  }>({})

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: parcel.name,
      cropType: (apiResponse?.request.cropType as "olive") ?? DEFAULT_CROP_TYPE,
      irrigationType:
        (parcel.irrigationType as IrrigationType) ?? undefined,
      areaM2: parcel.area > 0 ? Math.round(parcel.area * 10_000) : undefined,
    },
  })

  React.useEffect(() => {
    if (open) {
      form.reset({
        name: parcel.name,
        cropType:
          (apiResponse?.request.cropType as "olive") ?? DEFAULT_CROP_TYPE,
        irrigationType:
          (parcel.irrigationType as IrrigationType) ?? undefined,
        areaM2: parcel.area > 0 ? Math.round(parcel.area * 10_000) : undefined,
      })
    }
  }, [open, parcel, apiResponse, form])

  function handleClose() {
    onOpenChange(false)
    form.reset()
    setGeometryState({})
  }

  function handleGeometryFound(result: ParcelSearchResult) {
    setGeometryState({
      centroid: result.centroid
        ? `${result.centroid[1]},${result.centroid[0]}`
        : null,
      polygon: null,
      refcat: result.refcat ?? null,
      address: result.address ?? null,
    })
  }

  function onSubmit(values: FormValues) {
    const data = {
      ...values,
      ...geometryState,
    }

    updateParcel.mutate(
      { id: parcel.id, data },
      { onSuccess: handleClose }
    )
  }

  return (
    <Drawer open={open} onOpenChange={handleClose} direction={isMobile ? "bottom" : "right"}>
      <DrawerContent className="min-w-fit">
        <DrawerHeader className="gap-1">
          <DrawerTitle>Editar parcela</DrawerTitle>
          <DrawerDescription>
            Modifica los datos de {parcel.name}
          </DrawerDescription>
        </DrawerHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4 overflow-y-auto px-4 text-sm"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nombre
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre de la parcela" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cropType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de cultivo</FormLabel>
                  <FormControl>
                    <CropTypeSelector
                      value={(field.value as CropTypeValue) ?? DEFAULT_CROP_TYPE}
                      onChange={(v) => field.onChange(v)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="irrigationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de riego</FormLabel>
                  <Select
                    onValueChange={(v) =>
                      field.onChange(v as IrrigationType)
                    }
                    value={field.value ?? undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="dryland">Secano</SelectItem>
                      <SelectItem value="irrigated">Regadío</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="areaM2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Superficie (m²)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Ej: 50000"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <p className="text-sm font-medium">Ubicación</p>
              <ParcelSearch
                hasGeometry={Boolean(
                  geometryState.centroid || geometryState.polygon
                )}
                disabled={false}
                searchParcel={searchParcel}
                onFound={handleGeometryFound}
              />
            </div>
          </form>
        </Form>

        <DrawerFooter>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={updateParcel.isPending}>
            {updateParcel.isPending ? "Guardando..." : "Guardar cambios"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" disabled={updateParcel.isPending}>
              Cancelar
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
