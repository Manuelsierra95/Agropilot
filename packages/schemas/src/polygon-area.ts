const HECTARES_TO_SQUARE_METERS = 10_000

export function squareMetersToHectares(areaM2: number): number {
  return Math.round((areaM2 / HECTARES_TO_SQUARE_METERS) * 10000) / 10000
}

export function formatAreaHa(area: number): string {
  return area.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })
}
