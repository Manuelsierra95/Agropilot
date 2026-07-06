"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { api } from "@workspace/web/lib/api"
import type { HarvestDeliveryCreateInput } from "@workspace/schemas"

export function useCreateHarvestDelivery() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: HarvestDeliveryCreateInput) =>
      api.production.createHarvestDelivery(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["harvest-deliveries"] })
    },
  })
}
