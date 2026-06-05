import type { ParcelAddress } from "@/lib/cadastre/types"

interface ParcelLocationSummaryProps {
  refcat?: string | null
  address?: ParcelAddress | null
}

function formatValue(value?: string | null) {
  const trimmed = value?.trim()
  return trimmed || "—"
}

function hasAddressData(address?: ParcelAddress | null) {
  if (!address) return false
  return Object.values(address).some((value) => value?.trim())
}

export function ParcelLocationSummary({
  refcat,
  address,
}: ParcelLocationSummaryProps) {
  const trimmedRefcat = refcat?.trim()
  if (!trimmedRefcat && !hasAddressData(address)) {
    return null
  }

  const streetLine = [
    address?.streetType,
    address?.streetName,
    address?.streetNumber,
  ]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ")

  return (
    <div className="shrink-0 border-b border-sidebar-border bg-sidebar/95 px-4 py-3 backdrop-blur-sm">
      <dl className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
        {trimmedRefcat ? (
          <div className="sm:col-span-2">
            <dt className="text-xs text-muted-foreground">
              Referencia catastral
            </dt>
            <dd className="mt-0.5 font-mono text-xs font-medium tracking-wide text-foreground">
              {trimmedRefcat}
            </dd>
          </div>
        ) : null}

        {address?.province ? (
          <div>
            <dt className="text-xs text-muted-foreground">Provincia</dt>
            <dd className="mt-0.5 font-medium text-foreground">
              {formatValue(address.province)}
            </dd>
          </div>
        ) : null}

        {address?.municipality ? (
          <div>
            <dt className="text-xs text-muted-foreground">Municipio</dt>
            <dd className="mt-0.5 font-medium text-foreground">
              {formatValue(address.municipality)}
            </dd>
          </div>
        ) : null}

        {streetLine ? (
          <div>
            <dt className="text-xs text-muted-foreground">Dirección</dt>
            <dd className="mt-0.5 font-medium text-foreground">{streetLine}</dd>
          </div>
        ) : null}

        {address?.postalCode ? (
          <div>
            <dt className="text-xs text-muted-foreground">Código postal</dt>
            <dd className="mt-0.5 font-medium text-foreground">
              {formatValue(address.postalCode)}
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  )
}
