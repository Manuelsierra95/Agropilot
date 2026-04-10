export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(amount)
}

export function toSafeDate(date: unknown): Date | null {
  if (!date) return null
  const d = date instanceof Date ? date : new Date(date as string)
  return isNaN(d.getTime()) ? null : d
}

export function formatDate(date: unknown) {
  const d = toSafeDate(date)
  if (!d) return "—"
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d)
}
