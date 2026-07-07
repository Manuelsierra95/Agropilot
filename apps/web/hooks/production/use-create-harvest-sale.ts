"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { api } from "@workspace/web/lib/api"
import type { HarvestSaleCreateInput } from "@workspace/schemas"

export function useCreateHarvestSale() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: HarvestSaleCreateInput) =>
      api.production.createHarvestSale(data),
    onSuccess: () => {
      toast.success("Venta registrada")
      queryClient.invalidateQueries({ queryKey: ["harvest-deliveries"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
    onError: () => {
      toast.error("Error al registrar la venta")
    },
  })
}
