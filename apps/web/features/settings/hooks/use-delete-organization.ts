"use client"

import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { authClient, signOut } from "@workspace/web/lib/auth-client"

export function useDeleteOrganization() {
  const router = useRouter()

  return useMutation({
    mutationFn: async (organizationId: string) => {
      const { data, error } = await authClient.organization.delete({
        organizationId,
      })

      if (error) {
        throw new Error(error.message ?? "No se pudo eliminar la organización")
      }

      return data
    },
    onSuccess: async () => {
      toast.success("Organización eliminada")
      await signOut()
      router.push("/auth/sign-in")
    },
    onError: () => {
      toast.error("No se pudo eliminar la organización.")
    },
  })
}
