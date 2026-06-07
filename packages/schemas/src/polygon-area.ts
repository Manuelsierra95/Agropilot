const HECTARES_TO_SQUARE_METERS = 10_000

export function hectaresToSquareMeters(areaHa: number): number {
  return Math.round(areaHa * HECTARES_TO_SQUARE_METERS)
}

export function formatAreaHa(area: number): string {
  return area.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })
}
