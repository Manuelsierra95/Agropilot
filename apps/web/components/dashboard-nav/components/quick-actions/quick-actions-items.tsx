import {
  Droplets,
  Sprout,
  Wheat,
  Bug,
  Receipt,
  Banknote,
  Map,
  CalendarPlus,
  FileSpreadsheet,
  type LucideIcon,
} from "lucide-react"

export type QuickActionsItem = {
  id: string
  label: string
  description: string
  icon: LucideIcon
}

export type QuickActionsGroup = {
  group: string
  items: QuickActionsItem[]
}

export const quickActionsItems: QuickActionsGroup[] = [
  {
    group: "Eventos de campo",
    items: [
      {
        id: "irrigation",
        label: "Riego",
        description: "Registrar evento de riego",
        icon: Droplets,
      },
      {
        id: "treatment",
        label: "Tratamiento",
        description: "Fitosanitario o abonado",
        icon: Sprout,
      },
      {
        id: "harvest",
        label: "Cosecha",
        description: "Registrar recolección",
        icon: Wheat,
      },
      {
        id: "pest",
        label: "Plaga / Incidencia",
        description: "Alerta fitosanitaria",
        icon: Bug,
      },
    ],
  },
  {
    group: "Finanzas",
    items: [
      {
        id: "expense",
        label: "Gasto",
        description: "Semillas, combustible…",
        icon: Receipt,
      },
      {
        id: "income",
        label: "Ingreso",
        description: "Venta de cosecha u otro",
        icon: Banknote,
      },
      {
        id: "bulkFinance",
        label: "Importar finanzas",
        description: "Importar movimientos desde Excel",
        icon: FileSpreadsheet,
      },
    ],
  },
  {
    group: "Gestión",
    items: [
      {
        id: "parcel",
        label: "Nueva parcela",
        description: "Registrar una parcela",
        icon: Map,
      },
      {
        id: "task",
        label: "Tarea pendiente",
        description: "Añadir al calendario",
        icon: CalendarPlus,
      },
    ],
  },
]
