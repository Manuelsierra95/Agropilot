export interface DemoParcel {
  name: string
  area: number
  type: string
  irrigationType: string
  geometryType: string
  geometryCoordinates: number[][][]
  description: string
}

export const demoParcels: DemoParcel[] = [
  {
    name: 'Parcela Norte',
    area: 5.2,
    type: 'Olivar',
    irrigationType: 'Goteo',
    geometryType: 'Polygon',
    geometryCoordinates: [
      [
        [-3.70379, 40.416775],
        [-3.70369, 40.416775],
        [-3.70369, 40.416875],
        [-3.70379, 40.416875],
        [-3.70379, 40.416775],
      ],
    ],
    description: 'Parcela principal de olivos',
  },
  {
    name: 'Parcela Sur',
    area: 3.8,
    type: 'Almendros',
    irrigationType: 'Aspersión',
    geometryType: 'Polygon',
    geometryCoordinates: [
      [
        [-3.704, 40.4165],
        [-3.7039, 40.4165],
        [-3.7039, 40.4166],
        [-3.704, 40.4166],
        [-3.704, 40.4165],
      ],
    ],
    description: 'Parcela secundaria con almendros',
  },
  {
    name: 'Parcela Este',
    area: 4.5,
    type: 'Viñedo',
    irrigationType: 'Goteo',
    geometryType: 'Polygon',
    geometryCoordinates: [
      [
        [-3.7025, 40.417],
        [-3.7015, 40.417],
        [-3.7015, 40.4171],
        [-3.7025, 40.4171],
        [-3.7025, 40.417],
      ],
    ],
    description: 'Parcela de viñedos para producción de vino',
  },
]
