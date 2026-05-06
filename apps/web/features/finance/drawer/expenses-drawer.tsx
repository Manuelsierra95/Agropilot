"use client"

import {
  IconLeaf,
  IconDroplet,
  IconTractor,
  IconFlame,
  IconUsers,
  IconShield,
  IconWind,
} from "@tabler/icons-react"
import {
  CategoryDrawer,
  type CategoryTransaction,
  type IconComponent,
} from "./category-drawer"

// ---------------------------------------------------------------------------
// Re-export public props type
// ---------------------------------------------------------------------------

export interface ExpensesDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: string
  amount: number
  percentage: string
  color: string
  transactions?: CategoryTransaction[]
}

// ---------------------------------------------------------------------------
// Mock data — 8 categorías agrícolas, 2024
// ---------------------------------------------------------------------------

const mockExpensesByCategory: Record<string, CategoryTransaction[]> = {
  Semillas: [
    {
      id: 101,
      date: new Date("2024-03-10"),
      concept: "Semillas de trigo blando variedad Chamorro",
      amount: 420,
      paymentMethod: "transferencia",
      invoiceNumber: "FAC-2024-0312",
    },
    {
      id: 102,
      date: new Date("2024-03-15"),
      concept: "Semillas de girasol híbrido NK Ferti",
      amount: 280,
      paymentMethod: "tarjeta",
      invoiceNumber: "FAC-2024-0318",
    },
    {
      id: 103,
      date: new Date("2024-09-02"),
      concept: "Semillas de colza variedad Toccata",
      amount: 140,
      paymentMethod: "efectivo",
      invoiceNumber: null,
    },
    {
      id: 104,
      date: new Date("2024-09-20"),
      concept: "Semillas de cebada de invierno Pewter",
      amount: 195,
      paymentMethod: "transferencia",
      invoiceNumber: "FAC-2024-0987",
    },
    {
      id: 105,
      date: new Date("2024-10-05"),
      concept: "Semillas de veza-avena para cubierta vegetal",
      amount: 88,
      paymentMethod: "efectivo",
      invoiceNumber: null,
    },
    {
      id: 106,
      date: new Date("2024-11-12"),
      concept: "Semillas de triticale var. Amarillo",
      amount: 160,
      paymentMethod: "tarjeta",
      invoiceNumber: "FAC-2024-1154",
    },
    {
      id: 107,
      date: new Date("2024-11-28"),
      concept: "Semillas de avena negra forrajera",
      amount: 98,
      paymentMethod: "efectivo",
      invoiceNumber: null,
    },
  ],

  Fertilizantes: [
    {
      id: 201,
      date: new Date("2024-02-14"),
      concept: "Urea granulada 46% N (2.000 kg)",
      amount: 680,
      paymentMethod: "transferencia",
      invoiceNumber: "FAC-2024-0189",
    },
    {
      id: 202,
      date: new Date("2024-03-01"),
      concept: "Nitrato amónico 33.5% (1.500 kg)",
      amount: 420,
      paymentMethod: "transferencia",
      invoiceNumber: "FAC-2024-0241",
    },
    {
      id: 203,
      date: new Date("2024-04-10"),
      concept: "Superfosfato triple 45% P₂O₅",
      amount: 310,
      paymentMethod: "tarjeta",
      invoiceNumber: "FAC-2024-0398",
    },
    {
      id: 204,
      date: new Date("2024-04-22"),
      concept: "Cloruro potásico 60% K₂O (1.200 kg)",
      amount: 245,
      paymentMethod: "transferencia",
      invoiceNumber: "FAC-2024-0421",
    },
    {
      id: 205,
      date: new Date("2024-06-03"),
      concept: "Abono líquido foliar con micronutrientes",
      amount: 178,
      paymentMethod: "efectivo",
      invoiceNumber: null,
    },
    {
      id: 206,
      date: new Date("2024-09-15"),
      concept: "Complejo NPK 15-15-15 fondo siembra",
      amount: 390,
      paymentMethod: "transferencia",
      invoiceNumber: "FAC-2024-0912",
    },
    {
      id: 207,
      date: new Date("2024-10-18"),
      concept: "Sulfato de magnesio granulado",
      amount: 85,
      paymentMethod: "tarjeta",
      invoiceNumber: "FAC-2024-1039",
    },
    {
      id: 208,
      date: new Date("2024-12-02"),
      concept: "Enmienda caliza dolomítica 2 t/ha",
      amount: 142,
      paymentMethod: "transferencia",
      invoiceNumber: "FAC-2024-1201",
    },
  ],

  Fitosanitarios: [
    {
      id: 301,
      date: new Date("2024-03-22"),
      concept: "Herbicida mesosulfurón-metil (Atlantis OD)",
      amount: 112,
      paymentMethod: "tarjeta",
      invoiceNumber: "FAC-2024-0325",
    },
    {
      id: 302,
      date: new Date("2024-04-05"),
      concept: "Fungicida triazol + estrobilurina (Input Xpro)",
      amount: 98,
      paymentMethod: "tarjeta",
      invoiceNumber: "FAC-2024-0407",
    },
    {
      id: 303,
      date: new Date("2024-05-14"),
      concept: "Insecticida lambda-cihalotrina polilla del trigo",
      amount: 55,
      paymentMethod: "efectivo",
      invoiceNumber: null,
    },
    {
      id: 304,
      date: new Date("2024-07-08"),
      concept: "Fungicida mancozeb + metalaxil girasol",
      amount: 72,
      paymentMethod: "transferencia",
      invoiceNumber: "FAC-2024-0715",
    },
    {
      id: 305,
      date: new Date("2024-09-18"),
      concept: "Herbicida glifosato 36% (desverdeo rastrojo)",
      amount: 48,
      paymentMethod: "efectivo",
      invoiceNumber: null,
    },
    {
      id: 306,
      date: new Date("2024-10-30"),
      concept: "Fungicida protectante semilla colza (Celest)",
      amount: 40,
      paymentMethod: "tarjeta",
      invoiceNumber: "FAC-2024-1102",
    },
  ],

  Combustible: [
    {
      id: 401,
      date: new Date("2024-01-15"),
      concept: "Gasoil B agrícola — repostaje enero",
      amount: 95,
      paymentMethod: "tarjeta",
      invoiceNumber: "GAR-2024-0101",
    },
    {
      id: 402,
      date: new Date("2024-02-20"),
      concept: "Gasoil B agrícola — repostaje febrero",
      amount: 88,
      paymentMethod: "tarjeta",
      invoiceNumber: "GAR-2024-0202",
    },
    {
      id: 403,
      date: new Date("2024-03-18"),
      concept: "Gasoil B agrícola — laboreo primavera",
      amount: 132,
      paymentMethod: "transferencia",
      invoiceNumber: "GAR-2024-0318",
    },
    {
      id: 404,
      date: new Date("2024-06-25"),
      concept: "Gasoil B agrícola — campaña cosecha",
      amount: 210,
      paymentMethod: "transferencia",
      invoiceNumber: "GAR-2024-0625",
    },
    {
      id: 405,
      date: new Date("2024-09-10"),
      concept: "Gasoil B agrícola — siembra otoño",
      amount: 155,
      paymentMethod: "tarjeta",
      invoiceNumber: "GAR-2024-0910",
    },
    {
      id: 406,
      date: new Date("2024-11-05"),
      concept: "Gasoil B agrícola — laboreo post-cosecha",
      amount: 78,
      paymentMethod: "efectivo",
      invoiceNumber: null,
    },
    {
      id: 407,
      date: new Date("2024-12-10"),
      concept: "Gasoil B agrícola — repostaje diciembre",
      amount: 62,
      paymentMethod: "tarjeta",
      invoiceNumber: "GAR-2024-1210",
    },
  ],

  "Mano de obra": [
    {
      id: 501,
      date: new Date("2024-03-25"),
      concept: "Cuadrilla siembra primaveral — 3 jornaleros",
      amount: 240,
      paymentMethod: "transferencia",
      invoiceNumber: "NOM-2024-0325",
    },
    {
      id: 502,
      date: new Date("2024-05-10"),
      concept: "Tratamiento fitosanitario — operario especialista",
      amount: 180,
      paymentMethod: "transferencia",
      invoiceNumber: "NOM-2024-0510",
    },
    {
      id: 503,
      date: new Date("2024-06-15"),
      concept: "Apoyo en campaña de cosecha — 5 jornaleros",
      amount: 350,
      paymentMethod: "efectivo",
      invoiceNumber: null,
    },
    {
      id: 504,
      date: new Date("2024-07-20"),
      concept: "Labores de acondicionamiento almacén",
      amount: 120,
      paymentMethod: "efectivo",
      invoiceNumber: null,
    },
    {
      id: 505,
      date: new Date("2024-09-28"),
      concept: "Cuadrilla siembra otoño — 4 jornaleros",
      amount: 310,
      paymentMethod: "transferencia",
      invoiceNumber: "NOM-2024-0928",
    },
    {
      id: 506,
      date: new Date("2024-11-20"),
      concept: "Mantenimiento sistemas de riego — técnico",
      amount: 160,
      paymentMethod: "transferencia",
      invoiceNumber: "NOM-2024-1120",
    },
  ],

  Seguros: [
    {
      id: 601,
      date: new Date("2024-01-20"),
      concept: "Prima seguro combinado cereal — AGROSEGURO",
      amount: 380,
      paymentMethod: "transferencia",
      invoiceNumber: "SEG-2024-0120",
    },
    {
      id: 602,
      date: new Date("2024-03-05"),
      concept: "Seguro de responsabilidad civil explotación",
      amount: 145,
      paymentMethod: "transferencia",
      invoiceNumber: "SEG-2024-0305",
    },
    {
      id: 603,
      date: new Date("2024-04-15"),
      concept: "Prima seguro girasol frente a pedrisco",
      amount: 210,
      paymentMethod: "tarjeta",
      invoiceNumber: "SEG-2024-0415",
    },
    {
      id: 604,
      date: new Date("2024-07-01"),
      concept: "Seguro de maquinaria agrícola (tractores)",
      amount: 195,
      paymentMethod: "transferencia",
      invoiceNumber: "SEG-2024-0701",
    },
    {
      id: 605,
      date: new Date("2024-09-10"),
      concept: "Prima seguro colza invierno AGROSEGURO",
      amount: 190,
      paymentMethod: "transferencia",
      invoiceNumber: "SEG-2024-0910",
    },
  ],

  Maquinaria: [
    {
      id: 701,
      date: new Date("2024-02-08"),
      concept: "Revisión ITV tractor John Deere 6130R",
      amount: 85,
      paymentMethod: "tarjeta",
      invoiceNumber: "TEC-2024-0208",
    },
    {
      id: 702,
      date: new Date("2024-03-12"),
      concept: "Reparación hidráulico sembradora Amazone",
      amount: 140,
      paymentMethod: "transferencia",
      invoiceNumber: "TEC-2024-0312",
    },
    {
      id: 703,
      date: new Date("2024-05-20"),
      concept: "Cambio filtros y aceite motor — tractor 8345R",
      amount: 210,
      paymentMethod: "tarjeta",
      invoiceNumber: "TEC-2024-0520",
    },
    {
      id: 704,
      date: new Date("2024-06-05"),
      concept: "Recambios cosechadora CLAAS Lexion 6600",
      amount: 320,
      paymentMethod: "transferencia",
      invoiceNumber: "TEC-2024-0605",
    },
    {
      id: 705,
      date: new Date("2024-09-03"),
      concept: "Reparación varillas segadora cabezal trigo",
      amount: 95,
      paymentMethod: "efectivo",
      invoiceNumber: null,
    },
    {
      id: 706,
      date: new Date("2024-11-18"),
      concept: "Amortización alquiler GPS autosteer campaña",
      amount: 180,
      paymentMethod: "transferencia",
      invoiceNumber: "TEC-2024-1118",
    },
  ],

  Riego: [
    {
      id: 801,
      date: new Date("2024-04-08"),
      concept: "Canon de agua SEIASA campaña de riego",
      amount: 58,
      paymentMethod: "transferencia",
      invoiceNumber: "RIE-2024-0408",
    },
    {
      id: 802,
      date: new Date("2024-05-15"),
      concept: "Energía eléctrica bomba de riego — mayo",
      amount: 42,
      paymentMethod: "transferencia",
      invoiceNumber: "RIE-2024-0515",
    },
    {
      id: 803,
      date: new Date("2024-06-12"),
      concept: "Energía eléctrica bomba de riego — junio",
      amount: 55,
      paymentMethod: "transferencia",
      invoiceNumber: "RIE-2024-0612",
    },
    {
      id: 804,
      date: new Date("2024-07-10"),
      concept: "Mantenimiento goteros y filtros de arena",
      amount: 48,
      paymentMethod: "efectivo",
      invoiceNumber: null,
    },
    {
      id: 805,
      date: new Date("2024-08-05"),
      concept: "Energía eléctrica bomba de riego — agosto",
      amount: 62,
      paymentMethod: "transferencia",
      invoiceNumber: "RIE-2024-0805",
    },
  ],
}

// ---------------------------------------------------------------------------
// Category icon map
// ---------------------------------------------------------------------------

const CATEGORY_ICONS: Record<string, IconComponent> = {
  Semillas: IconLeaf,
  Fertilizantes: IconDroplet,
  Fitosanitarios: IconWind,
  Combustible: IconFlame,
  "Mano de obra": IconUsers,
  Seguros: IconShield,
  Maquinaria: IconTractor,
  Riego: IconDroplet,
}

// ---------------------------------------------------------------------------
// Thin wrapper
// ---------------------------------------------------------------------------

export function ExpensesDrawer({
  open,
  onOpenChange,
  category,
  amount,
  percentage,
  color,
  transactions,
}: ExpensesDrawerProps) {
  return (
    <CategoryDrawer
      open={open}
      onOpenChange={onOpenChange}
      category={category}
      amount={amount}
      percentage={percentage}
      color={color}
      variant="expenses"
      categoryIcons={CATEGORY_ICONS}
      dataByCategory={mockExpensesByCategory}
      transactions={transactions}
    />
  )
}
