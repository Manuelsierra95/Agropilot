import type { InferResponseType } from "hono/client"
import { client } from "@/lib/api/client"

// export const parcelApi = {
//   // Queries
//   getAll:   async (): Promise<ParcelApi[]> => { ... },
//   getById:  async (id: string): Promise<ParcelApi> => { ... },

//   // Mutations
//   create: async (data: ParcelCreate): Promise<ParcelApi> => { ... },
//   update: async (id: string, data: ParcelUpdate): Promise<ParcelApi> => { ... },
//   delete: async (id: string): Promise<void> => { ... },
// }

// Usage:
// const parcels = await parcelApi.getAll()
// const parcel  = await parcelApi.getById(id)
// await parcelApi.create(data)
// await parcelApi.update(id, data)
// await parcelApi.delete(id)
