import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { api } from "@workspace/web/lib/api"
import { invalidateDashboard } from "@workspace/web/lib/dashboard/invalidate-dashboard"
import { useDashboardListsStore } from "@workspace/web/store/useDashboardListsStore"

export function useDeleteParcel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.parcel.deleteParcel(id),
    onSuccess: (_, id) => {
      toast.success("Parcela eliminada")

      useDashboardListsStore.setState((state) => ({
        parcels: state.parcels.filter((parcel) => parcel.id !== id),
      }))

      queryClient.invalidateQueries({ queryKey: ["parcels"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard", "parcelsList"] })
      invalidateDashboard(queryClient, [
        "finance",
        "production",
        "events",
        "parcels",
        "daily",
      ])
    },
    onError: () => {
      toast.error("Error al eliminar la parcela")
    },
  })
}
