"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { InvitationBulkCreateInput } from "@workspace/schemas"
import { organizationApi } from "@workspace/web/lib/api/routes/organization"

export function useBulkCreateInvitations(organizationId: string) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const queryKey = ["organization", organizationId, "invitations"] as const

  return useMutation({
    mutationFn: (data: InvitationBulkCreateInput) =>
      organizationApi.bulkCreateInvitations(data),
    onSuccess: (result) => {
      const count = result.count
      if (count === 1) {
        toast.success("Invitación enviada")
      } else {
        toast.success(`${count} invitaciones enviadas`)
      }

      if (result.failed.length > 0) {
        const failedEmails = result.failed.map((item) => item.email).join(", ")
        toast.error(
          `No se pudieron enviar algunas invitaciones: ${failedEmails}`
        )
      }

      void queryClient.invalidateQueries({ queryKey })
      router.refresh()
    },
    onError: () => {
      toast.error("No se pudieron enviar las invitaciones. Inténtalo de nuevo.")
    },
  })
}
