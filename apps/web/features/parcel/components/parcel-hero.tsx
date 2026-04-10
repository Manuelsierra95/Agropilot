import { Badge } from "@workspace/ui/components/badge"

import type { ParcelApiResponse } from "./parcel-types"
import type { WeatherRisks } from "@/store/parcel-weather.mock"
import { mockParcels } from "@/store/mockParcels"

import type { AllModeSummary, ParcelItem } from "./parcel-types"
import {
  formatDateTime,
  formatLongDate,
  formatNumber,
  riskToBadgeClass,
  riskToLabel,
} from "./parcel-utils"

type ParcelHeroProps = {
  isAllSelected: boolean
  activeParcel: ParcelItem
  allModeSummary: AllModeSummary
  risks?: WeatherRisks
  apiResponse?: ParcelApiResponse
}

export function ParcelHero({
  isAllSelected,
  activeParcel,
  allModeSummary,
  risks,
  apiResponse,
}: ParcelHeroProps) {
  const riskBadges = apiResponse
    ? [
        ["Riesgo hídrico", apiResponse.risks.waterStress],
        ["Riesgo fúngico", apiResponse.risks.fungalRisk],
        ["Riesgo insectos", apiResponse.risks.insectRisk],
        ["Estrés térmico", apiResponse.risks.thermalStress],
      ]
    : []

  return (
    <section className="rounded-xl border bg-linear-to-br from-card via-card to-muted/30 p-4 md:p-6">
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
            Inteligencia de Parcela
          </p>
          <h1 className="text-2xl leading-tight font-semibold md:text-3xl">
            {isAllSelected
              ? "Todas las parcelas"
              : (apiResponse?.request.cropName ?? activeParcel.name)}
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {isAllSelected
              ? "Vista comparativa global: identifica diferencias de lluvia, temperatura, déficit hídrico y estrés entre parcelas."
              : apiResponse
                ? `${activeParcel.description}. ${apiResponse.request.cropName} · ${apiResponse.request.days} días · ${formatLongDate(apiResponse.dataRange.start)} a ${formatLongDate(apiResponse.dataRange.end)}.`
                : `${activeParcel.description}. Monitoriza evolución térmica, precipitación, balance hídrico y riesgo agronómico en una vista única.`}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {isAllSelected ? (
          <>
            <Badge variant="outline">Parcelas: {mockParcels.length}</Badge>
            <Badge variant="outline">
              Superficie total: {formatNumber(allModeSummary.totalArea)} ha
            </Badge>
            <Badge variant="outline">
              Riesgo hídrico alto: {allModeSummary.highWaterStressCount}
            </Badge>
          </>
        ) : apiResponse ? (
          <>
            <Badge variant="outline">
              Parcela: {apiResponse.request.parcelId}
            </Badge>
            <Badge variant="outline">
              Coordenadas: {apiResponse.request.coords.lat.toFixed(4)},{" "}
              {apiResponse.request.coords.lng.toFixed(4)}
            </Badge>
            <Badge variant="outline">
              Estación: {apiResponse.summary.stationId}
            </Badge>
            <Badge variant="outline">
              Última actualización:{" "}
              {formatDateTime(apiResponse.summary.lastUpdate)}
            </Badge>
            <Badge variant="outline">Cultivo: {activeParcel.type}</Badge>
            <Badge variant="outline">Superficie: {activeParcel.area} ha</Badge>
            {riskBadges.map(([label, risk]) => (
              <Badge
                key={label}
                className={riskToBadgeClass(risk.level)}
                variant="outline"
              >
                {label}: {riskToLabel(risk.level)}
              </Badge>
            ))}
          </>
        ) : (
          <>
            <Badge variant="outline">Cultivo: {activeParcel.type}</Badge>
            <Badge variant="outline">
              Riego: {activeParcel.irrigationType}
            </Badge>
            <Badge variant="outline">Superficie: {activeParcel.area} ha</Badge>
            {risks ? (
              <>
                <Badge
                  className={riskToBadgeClass(risks.waterStress)}
                  variant="outline"
                >
                  Riesgo hídrico: {riskToLabel(risks.waterStress)}
                </Badge>
                <Badge
                  className={riskToBadgeClass(risks.pestRisk)}
                  variant="outline"
                >
                  Riesgo plagas: {riskToLabel(risks.pestRisk)}
                </Badge>
              </>
            ) : null}
          </>
        )}
      </div>
    </section>
  )
}
