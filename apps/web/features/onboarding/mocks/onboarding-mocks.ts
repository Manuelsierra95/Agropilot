import type { TransactionBulkRow } from "@workspace/schemas"

export type FinanceBulkRow = TransactionBulkRow

export const MOCK_FINANCE_ROWS: FinanceBulkRow[] = [
  {
    id: "mock-1",
    concept: "Fertilizante NPK",
    description: "Compra NPK 25kg",
    amount: 1240.5,
    date: "2025-01-15",
    category: "fertilization",
    flow: "expense",
    paymentMethod: "transferencia",
    invoiceNumber: "FAC-2025-0001",
  },
  {
    id: "mock-2",
    concept: "Venta aceite",
    description: "Cosecha virgen extra",
    amount: 4800,
    date: "2025-02-02",
    category: "sale",
    flow: "income",
    paymentMethod: "transferencia",
    invoiceNumber: "VTA-2025-001",
  },
  {
    id: "mock-3",
    concept: "Riego por goteo",
    description: "Mantenimiento sistema goteo",
    amount: 320,
    date: "2025-02-18",
    category: "irrigation",
    flow: "expense",
    paymentMethod: "efectivo",
    invoiceNumber: "FAC-2025-0002",
  },
]

export type TeamInviteRole = "admin" | "member" | "viewer"

export interface TeamInviteDraft {
  id: string
  email: string
  role: TeamInviteRole
}

export const TEAM_ROLE_LABELS: Record<TeamInviteRole, string> = {
  admin: "Administrador",
  member: "Miembro",
  viewer: "Solo lectura",
}

export type CatastroProvince = {
  Codigo: number
  Denominacion: string
}

export type CatastroMunicipality = {
  Codigo: number
  Denominacion: string
}

export type CatastroStreet = {
  Codigo: number
  Sigla: string
  TipoVia: string
  Denominacion: string
}
