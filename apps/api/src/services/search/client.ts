import { XMLParser } from "fast-xml-parser"

export const parser = new XMLParser({
  ignoreAttributes: false,
  // Preserve leading zeros in refcat segments (e.g. pc1 "0060304", car "0001").
  parseTagValue: false,
})

const CALLEJERO_BASE_URL =
  "https://www1.sedecatastro.gob.es/CYCBienInmueble/OVCBusqueda.aspx"

export const PROVINCES_URL = `${CALLEJERO_BASE_URL}/ObtenerProvincias`
export const MUNICIPALITIES_URL = `${CALLEJERO_BASE_URL}/ObtenerMunicipios`
export const STREETS_URL = `${CALLEJERO_BASE_URL}/ObtenerVias`

export const REFCAT_URL =
  "https://ovc.catastro.meh.es/ovcservweb/OVCSWLocalizacionRC/OVCCallejeroCodigos.asmx/Consulta_DNPRC_Codigos"

export const COORDS_URL =
  "https://ovc.catastro.meh.es/ovcservweb/OVCSWLocalizacionRC/OVCCoordenadas.asmx/Consulta_RCCOOR"

export const POLYGON_WFS_URL = "https://ovc.catastro.meh.es/INSPIRE/wfsCP.aspx"

type CatastroResponse<T> = {
  d: T[]
}

function mapToCatastroBody(input: {
  province?: number
  municipality?: number
  filtro?: string
}) {
  return {
    filtro: input.filtro ?? "",
    provincia: input.province,
    municipio: input.municipality,
  }
}

export async function postCatastro<T>(
  url: string,
  body: Record<string, string | number> = {}
) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Accept: "application/json",
    },
    body: JSON.stringify(mapToCatastroBody(body)),
  })

  console.log("Request to Catastro:", { url, body, status: response.status })

  if (!response.ok) {
    throw new Error(
      `Error en la petición: ${response.status} ${response.statusText}`
    )
  }

  const data = (await response.json()) as CatastroResponse<T>
  return data.d
}

export async function fetchCatastroXml(
  url: string,
  body: Record<string, string>
) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(body).toString(),
  })

  if (!response.ok) {
    throw new Error(`Catastro error: ${response.status}`)
  }

  return await response.text()
}
