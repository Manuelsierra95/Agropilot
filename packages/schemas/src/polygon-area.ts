export function formatAreaHa(area: number): string {
  return area.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })
}
