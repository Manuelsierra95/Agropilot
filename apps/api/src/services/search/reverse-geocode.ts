import { z } from "zod"

const PHOTON_REVERSE_URL = "https://photon.komoot.io/reverse"

const photonReverseSchema = z.object({
  features: z.array(
    z.object({
      properties: z.object({
        postcode: z.string().optional(),
      }),
    })
  ),
})

/** Resolves a Spanish postal code from coordinates when catastro omits it. */
export async function lookupPostalCodeByCoords(
  lat: number,
  lng: number
): Promise<string | undefined> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    limit: "1",
  })

  try {
    const response = await fetch(`${PHOTON_REVERSE_URL}?${params.toString()}`, {
      headers: { Accept: "application/json" },
    })

    if (!response.ok) return undefined

    const parsed = photonReverseSchema.safeParse(await response.json())
    const postcode = parsed.data?.features[0]?.properties.postcode?.trim()

    return postcode || undefined
  } catch {
    return undefined
  }
}
