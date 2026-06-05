import type { Municipality, Province, Street } from "@workspace/schemas"
import {
  MUNICIPALITIES_URL,
  postCatastro,
  PROVINCES_URL,
  STREETS_URL,
} from "./client"

export async function getProvinces(): Promise<Province[]> {
  return postCatastro<Province>(PROVINCES_URL)
}

export async function getMunicipalities(
  province: number
): Promise<Municipality[]> {
  return postCatastro<Municipality>(MUNICIPALITIES_URL, { province })
}

export async function getStreets({
  province,
  municipality,
}: {
  province: number
  municipality: number
}): Promise<Street[]> {
  return postCatastro<Street>(STREETS_URL, {
    province,
    municipality,
  })
}
