'use client'

import { useEffect, useRef, useState } from 'react'
import type L from 'leaflet'
import { useParcelStore } from '@/store/useParcelStore'
import { useGetParcels } from '@/hooks/useGetParcels'
import { Card, CardContent } from '@workspace/ui/components/card'
import './leaflet-custom.css'

export function Map() {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<L.Map | null>(null)
  const parcelLayersRef = useRef<L.GeoJSON[]>([])
  const [isClient, setIsClient] = useState(false)
  const parcelId = useParcelStore((state) => state.parcelId)
  const { parcels } = useGetParcels()

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || !mapRef.current) return

    // Importar dinámicamente leaflet solo en el cliente
    import('leaflet').then((L) => {
      if (leafletMapRef.current) return

      let initialCenter = [37.8882, -4.7794]
      if (parcels && parcels.length > 0) {
        const firstParcel = parcels[0]
        if (
          firstParcel &&
          firstParcel.geometryType === 'Polygon' &&
          Array.isArray(firstParcel.geometryCoordinates) &&
          firstParcel.geometryCoordinates.length > 0 &&
          Array.isArray(firstParcel.geometryCoordinates[0])
        ) {
          const coords = firstParcel.geometryCoordinates[0]
          if (coords && coords.length > 0) {
            const lats = coords
              .map((c) => (Array.isArray(c) && c.length > 1 ? c[1] : undefined))
              .filter((v): v is number => typeof v === 'number' && !isNaN(v))
            const lngs = coords
              .map((c) => (Array.isArray(c) && c.length > 0 ? c[0] : undefined))
              .filter((v): v is number => typeof v === 'number' && !isNaN(v))
            const lat =
              lats.length > 0
                ? lats.reduce((a, b) => a + b, 0) / lats.length
                : 37.8882
            const lng =
              lngs.length > 0
                ? lngs.reduce((a, b) => a + b, 0) / lngs.length
                : -4.7794
            initialCenter = [lat, lng]
          }
        }
      }

      // Crear el mapa centrado en la primera parcela
      const map = L.map(mapRef.current!, {
        center: initialCenter as [number, number],
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
      })

      leafletMapRef.current = map

      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          attribution:
            'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        }
      ).addTo(map)

      // Cargar áreas de todas las parcelas al crear el mapa
      parcelLayersRef.current.forEach((layer) => {
        map.removeLayer(layer)
      })
      parcelLayersRef.current = []
      parcels.forEach((parcel) => {
        const geoJsonFeature = {
          type: 'Feature' as const,
          geometry: {
            type: parcel.geometryType,
            coordinates: parcel.geometryCoordinates,
          } as any,
          properties: {
            id: parcel.id,
            name: parcel.name,
            area: parcel.area,
            type: parcel.type,
          },
        }
        const geoJsonLayer = L.geoJSON(geoJsonFeature, {
          style: (feature) => ({
            color: parcel.id?.toString() === parcelId ? '#3b82f6' : '#10b981',
            weight: parcel.id?.toString() === parcelId ? 3 : 2,
            opacity: 1,
            fillColor:
              parcel.id?.toString() === parcelId ? '#3b82f6' : '#10b981',
            fillOpacity: 0.2,
          }),
          onEachFeature: (feature, layer) => {
            const popupContent = `
              <div style="min-width: 150px;">
                <h3 style="margin: 0 0 8px 0; font-weight: 600;">${parcel.name}</h3>
                ${parcel.area ? `<p style="margin: 4px 0;">Área: ${parcel.area} ha</p>` : ''}
                ${parcel.type ? `<p style="margin: 4px 0;">Cultivo: ${parcel.type}</p>` : ''}
              </div>
            `
            layer.bindPopup(popupContent)
            layer.on('click', () => {
              useParcelStore
                .getState()
                .setParcelId(parcel.id?.toString() || null)
            })
          },
        }).addTo(map)
        parcelLayersRef.current.push(geoJsonLayer)
      })
      if (
        parcels.length > 0 &&
        parcelLayersRef.current.length > 0 &&
        !parcelId
      ) {
        const group = L.featureGroup(parcelLayersRef.current)
        map.fitBounds(group.getBounds(), { padding: [50, 50] })
      }
    })

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove()
        leafletMapRef.current = null
      }
    }
  }, [isClient, parcels])

  useEffect(() => {
    if (!leafletMapRef.current || parcelLayersRef.current.length === 0) return

    parcelLayersRef.current.forEach((layer, index) => {
      const parcel = parcels[index]
      if (!parcel) return

      const isSelected = parcel.id?.toString() === parcelId

      layer.setStyle({
        color: isSelected ? '#3b82f6' : '#10b981',
        weight: isSelected ? 3 : 2,
        opacity: 1,
        fillColor: isSelected ? '#3b82f6' : '#10b981',
        fillOpacity: 0.2,
      })

      if (isSelected) {
        layer.bringToFront()

        const bounds = layer.getBounds()
        leafletMapRef.current?.flyToBounds(bounds, {
          padding: [50, 50],
          duration: 1.5,
          easeLinearity: 0.25,
        })
      }
    })
  }, [parcelId, parcels])

  if (!isClient) {
    return (
      <Card className="col-span-1 sm:col-span-2 md:col-span-4 lg:col-span-8 overflow-hidden p-0 h-[45vh]">
        <CardContent className="p-0 h-full w-full">
          <div className="w-full h-full bg-muted/50 rounded-md flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                <svg
                  className="w-6 h-6 animate-pulse"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"
                  />
                </svg>
              </div>
              <p className="text-sm">Cargando mapa...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
  return (
    <Card className="col-span-1 sm:col-span-2 md:col-span-4 lg:col-span-8 overflow-hidden p-0 h-[45vh]">
      <CardContent className="p-0 h-full w-full">
        <div className="w-full h-full relative rounded-md overflow-hidden">
          <div ref={mapRef} className="w-full h-full" />
        </div>
      </CardContent>
    </Card>
  )
}
