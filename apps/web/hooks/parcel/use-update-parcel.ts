import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { api } from "@/lib/api"
import type { ParcelUpdateInput } from "@workspace/schemas"

export function useUpdateParcel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ParcelUpdateInput }) =>
      api.parcel.updateParcel(id, data),
    onSuccess: () => {
      toast.success("Parcela actualizada")
      queryClient.invalidateQueries({ queryKey: ["parcels"] })
    },
    onError: () => {
      toast.error("Error al actualizar la parcela")
    },
  })
}
