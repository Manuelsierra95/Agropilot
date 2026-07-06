import {
  Wheat,
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
  href?: string
}

export const quickActionsItems: QuickActionsItem[] = [
  {
    id: "task",
    label: "Añadir tarea",
    description: "Nueva tarea para el calendario",
    icon: CalendarPlus,
  },
  {
    id: "harvest",
    label: "Añadir cosecha",
    description: "Registrar una entrega de cosecha",
    icon: Wheat,
  },
  {
    id: "expense",
    label: "Añadir gasto",
    description: "Registrar un gasto",
    icon: Receipt,
  },
  {
    id: "income",
    label: "Añadir ingreso",
    description: "Registrar un ingreso",
    icon: Banknote,
  },
  {
    id: "bulkFinance",
    label: "Bulk de finanzas",
    description: "Importar movimientos desde Excel",
    icon: FileSpreadsheet,
  },
  {
    id: "parcel",
    label: "Crear parcela",
    description: "Registrar una nueva parcela",
    icon: Map,
  },
]
