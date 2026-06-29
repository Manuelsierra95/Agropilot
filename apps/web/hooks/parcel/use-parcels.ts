import { useQuery } from "@tanstack/react-query"
import { api } from "@workspace/web/lib/api"

export function useParcels() {
  return useQuery({
    queryKey: ["parcels", "list"],
    queryFn: () => api.parcel.getListParcels(),
  })
}
