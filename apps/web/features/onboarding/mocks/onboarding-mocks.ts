export interface FinanceBulkRow {
  id: string
  concept: string
  amount: number
  date: string
  category: string
  flow: "income" | "expense"
}

export const MOCK_FINANCE_ROWS: FinanceBulkRow[] = [
  {
    id: "mock-1",
    concept: "Fertilizante NPK",
    amount: 1240.5,
    date: "2025-01-15",
    category: "fertilization",
    flow: "expense",
  },
  {
    id: "mock-2",
    concept: "Venta aceite",
    amount: 4800,
    date: "2025-02-02",
    category: "sale",
    flow: "income",
  },
  {
    id: "mock-3",
    concept: "Riego por goteo",
    amount: 320,
    date: "2025-02-18",
    category: "irrigation",
    flow: "expense",
  },
]

export type TeamInviteRole = "admin" | "member" | "viewer"

export interface TeamInviteDraft {
  id: string
  email: string
  role: TeamInviteRole
}

export const MOCK_TEAM_INVITES: TeamInviteDraft[] = [
  { id: "invite-1", email: "agronomo@ejemplo.com", role: "member" },
  { id: "invite-2", email: "contabilidad@ejemplo.com", role: "viewer" },
]

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

export const MOCK_CATASTRO_PROVINCES: CatastroProvince[] = [
  { Codigo: 23, Denominacion: "JAEN" },
  { Codigo: 18, Denominacion: "GRANADA" },
  { Codigo: 41, Denominacion: "SEVILLA" },
]

export const MOCK_CATASTRO_MUNICIPALITIES: Record<string, CatastroMunicipality[]> =
  {
    JAEN: [
      { Codigo: 28, Denominacion: "CAZORLA" },
      { Codigo: 50, Denominacion: "JAEN" },
      { Codigo: 73, Denominacion: "UBEDA" },
    ],
    GRANADA: [
      { Codigo: 37, Denominacion: "GRANADA" },
      { Codigo: 87, Denominacion: "LOJA" },
    ],
    SEVILLA: [{ Codigo: 91, Denominacion: "SEVILLA" }],
  }

export const MOCK_CATASTRO_STREETS: Record<string, CatastroStreet[]> = {
  "JAEN-CAZORLA": [
    {
      Codigo: 1,
      Sigla: "CL",
      TipoVia: "CALLE",
      Denominacion: "TORRE BAJA",
    },
    {
      Codigo: 2,
      Sigla: "AV",
      TipoVia: "AVENIDA",
      Denominacion: "DE LA VIRGEN DE MONTESION",
    },
    {
      Codigo: 3,
      Sigla: "PZ",
      TipoVia: "PLAZA",
      Denominacion: "DE LA CORREDERA",
    },
  ],
  "JAEN-JAEN": [
    {
      Codigo: 10,
      Sigla: "CL",
      TipoVia: "CALLE",
      Denominacion: "LIBERTAD",
    },
  ],
}
