type ParcelNamed = {
  parcelId: string
  name: string
}

function truncateParcelName(name: string, maxLength = 14): string {
  return name.length > maxLength ? `${name.slice(0, maxLength - 2)}…` : name
}

/**
 * Builds chart rows with unique `axisLabel` keys (for bar xDataKey) when parcel
 * names collide after truncation.
 */
export function buildParcelChartRows<
  T extends ParcelNamed,
  V extends Record<string, number>,
>(items: T[], mapValues: (item: T) => V) {
  const shorts = items.map((item) => truncateParcelName(item.name))
  const duplicateShorts = new Set(
    shorts.filter((label, index) => shorts.indexOf(label) !== index)
  )
  const seen = new Map<string, number>()

  return items.map((item, index) => {
    const short = shorts[index]!
    let axisLabel = short

    if (duplicateShorts.has(short)) {
      const occurrence = (seen.get(short) ?? 0) + 1
      seen.set(short, occurrence)
      axisLabel = `${short} #${occurrence}`
    }

    return {
      axisLabel,
      fullName: item.name,
      parcelId: item.parcelId,
      ...mapValues(item),
    }
  })
}
