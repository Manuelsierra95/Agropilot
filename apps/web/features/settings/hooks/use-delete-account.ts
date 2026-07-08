"use client"

import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { authClient } from "@workspace/web/lib/auth-client"

export function useDeleteAccount() {
  const router = useRouter()

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await authClient.deleteUser({
        callbackURL: `${window.location.origin}/auth/sign-in`,
      })

      if (error) {
        throw new Error(error.message ?? "No se pudo eliminar la cuenta")
      }

      return data
    },
    onSuccess: (data) => {
      if (data?.message === "Verification email sent") {
        toast.success(
          "Revisa tu correo para confirmar la eliminación de tu cuenta"
        )
        return
      }

      toast.success("Cuenta eliminada")
      router.push("/auth/sign-in")
    },
    onError: (error: Error) => {
      const isStaleSession = error.message
        .toLowerCase()
        .includes("session")

      toast.error(
        isStaleSession
          ? "Por seguridad, cierra sesión e inicia sesión de nuevo antes de eliminar tu cuenta."
          : "No se pudo eliminar la cuenta."
      )
    },
  })
}
