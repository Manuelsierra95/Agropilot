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
    description: "Planificar una tarea en el calendario",
    icon: CalendarPlus,
  },
  {
    id: "harvest",
    label: "Registrar entrega",
    description: "Registrar entrega a cooperativa",
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
    label: "Importar finanzas",
    description: "Subir movimientos desde Excel",
    icon: FileSpreadsheet,
  },
  {
    id: "parcel",
    label: "Añadir parcela",
    description: "Registrar una nueva parcela",
    icon: Map,
  },
]
