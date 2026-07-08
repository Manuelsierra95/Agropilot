"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { InvitationSelect } from "@workspace/schemas"
import { organizationApi } from "@workspace/web/lib/api/routes/organization"

const invitationsQueryKey = (organizationId: string) =>
  ["organization", organizationId, "invitations"] as const

export function useCancelInvitation(organizationId: string) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const queryKey = invitationsQueryKey(organizationId)

  return useMutation({
    mutationFn: (id: string) => organizationApi.cancelInvitation(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey })

      const previous = queryClient.getQueryData<InvitationSelect[]>(queryKey)

      queryClient.setQueryData<InvitationSelect[]>(queryKey, (old) =>
        (old ?? []).filter((invitation) => invitation.id !== id)
      )

      return { previous }
    },
    onSuccess: () => {
      toast.success("Invitación cancelada")
      void queryClient.invalidateQueries({ queryKey })
      router.refresh()
    },
    onError: (error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous)
      }

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo cancelar la invitación."
      )
    },
  })
}
