"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { api } from "@workspace/web/lib/api"
import { recommendationsQueryKeys } from "@workspace/web/features/tasks/lib/recommendations-query-keys"
import type { RecommendationAcceptInput } from "@workspace/schemas"

export function useRecommendations(parcelId?: string) {
  return useQuery({
    queryKey: recommendationsQueryKeys.list(parcelId),
    queryFn: () => api.recommendations.listRecommendations({ parcelId }),
  })
}

export function useAcceptRecommendation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      recommendationId,
      input,
    }: {
      recommendationId: string
      input?: RecommendationAcceptInput
    }) => api.recommendations.acceptRecommendation(recommendationId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: recommendationsQueryKeys.all,
      })
    },
  })
}

export function useDismissRecommendation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (recommendationId: string) =>
      api.recommendations.dismissRecommendation(recommendationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: recommendationsQueryKeys.all,
      })
    },
  })
}
