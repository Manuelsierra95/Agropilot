"use client"

import {
  IconPlant2,
  IconMilk,
  IconTruck,
  IconBuildingStore,
  IconCoin,
  IconLeaf,
  IconSettings,
  IconDroplet,
} from "@tabler/icons-react"
import {
  CategoryDrawer,
  type CategoryTransaction,
  type IconComponent,
} from "./components/category-drawer"

// ---------------------------------------------------------------------------
// Re-export public props type
// ---------------------------------------------------------------------------

export interface IncomeDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: string
  amount: number
  percentage: string
  color: string
  transactions?: CategoryTransaction[]
}

// ---------------------------------------------------------------------------
// Mock data — 8 categorías de ingresos agrícolas, 2024
// ---------------------------------------------------------------------------

const mockIncomesByCategory: Record<string, CategoryTransaction[]> = {
  "Venta de cereales": [
    {
      id: 201,
      date: new Date("2024-07-12"),
      concept: "Venta trigo blando campaña verano — Almacén Coop. La Mancha",
      amount: 1850,
      paymentMethod: "transferencia",
      invoiceNumber: "VTA-2024-0701",
    },
    {
      id: 202,
      date: new Date("2024-07-28"),
      concept: "Venta cebada maltería a Maltería Estrella",
      amount: 1200,
      paymentMethod: "transferencia",
      invoiceNumber: "VTA-2024-0742",
    },
    {
      id: 203,
      date: new Date("2024-08-05"),
      concept: "Venta trigo duro variedad Simeto — 20 t",
      amount: 2100,
      paymentMethod: "transferencia",
      invoiceNumber: "VTA-2024-0803",
    },
    {
      id: 204,
      date: new Date("2024-08-19"),
      concept: "Venta maíz grano seco — Granero del Sur",
      amount: 980,
      paymentMethod: "transferencia",
      invoiceNumber: "VTA-2024-0819",
    },
    {
      id: 205,
      date: new Date("2024-09-03"),
      concept: "Venta centeno invierno — mercado local",
      amount: 540,
      paymentMethod: "efectivo",
      invoiceNumber: null,
    },
    {
      id: 206,
      date: new Date("2024-11-15"),
      concept: "Venta trigo blando campaña otoño — Almacén Coop. La Mancha",
      amount: 1630,
      paymentMethod: "transferencia",
      invoiceNumber: "VTA-2024-1115",
    },
    {
      id: 207,
      date: new Date("2024-12-02"),
      concept: "Venta avena para forraje — Granja Montiel",
      amount: 720,
      paymentMethod: "tarjeta",
      invoiceNumber: "VTA-2024-1202",
    },
  ],
  "Venta de girasol": [
    {
      id: 211,
      date: new Date("2024-09-10"),
      concept: "Venta girasol alto oleico — Oleaginosas del Centro",
      amount: 1540,
      paymentMethod: "transferencia",
      invoiceNumber: "VTA-2024-0910",
    },
    {
      id: 212,
      date: new Date("2024-09-22"),
      concept: "Venta girasol confitero — Comercial Agrosol",
      amount: 890,
      paymentMethod: "transferencia",
      invoiceNumber: "VTA-2024-0922",
    },
    {
      id: 213,
      date: new Date("2024-10-08"),
      concept: "Venta subproducto harina girasol — Piensos Norte",
      amount: 340,
      paymentMethod: "tarjeta",
      invoiceNumber: "VTA-2024-1008",
    },
    {
      id: 214,
      date: new Date("2024-10-25"),
      concept: "Venta girasol estándar — Almacén Coop. La Mancha",
      amount: 1120,
      paymentMethod: "transferencia",
      invoiceNumber: "VTA-2024-1025",
    },
    {
      id: 215,
      date: new Date("2024-11-07"),
      concept: "Venta aceite crudo bruto en origen — aceite 1ª presión",
      amount: 860,
      paymentMethod: "efectivo",
      invoiceNumber: null,
    },
  ],
  "Subvenciones PAC": [
    {
      id: 221,
      date: new Date("2024-05-20"),
      concept: "Pago básico por superficie — anticipo campaña 2024",
      amount: 2100,
      paymentMethod: "transferencia",
      invoiceNumber: "PAC-2024-ATC01",
    },
    {
      id: 222,
      date: new Date("2024-10-14"),
      concept: "Pago básico por superficie — liquidación definitiva",
      amount: 1800,
      paymentMethod: "transferencia",
      invoiceNumber: "PAC-2024-LIQ01",
    },
    {
      id: 223,
      date: new Date("2024-06-05"),
      concept: "Ayuda asociada cultivos herbáceos — trigo y cebada",
      amount: 950,
      paymentMethod: "transferencia",
      invoiceNumber: "PAC-2024-ASC01",
    },
    {
      id: 224,
      date: new Date("2024-07-18"),
      concept: "Eco-régimen prácticas beneficiosas para el clima",
      amount: 640,
      paymentMethod: "transferencia",
      invoiceNumber: "PAC-2024-ECO01",
    },
    {
      id: 225,
      date: new Date("2024-11-28"),
      concept: "Pago redistributivo pequeñas explotaciones",
      amount: 310,
      paymentMethod: "transferencia",
      invoiceNumber: "PAC-2024-RED01",
    },
  ],
  "Arrendamiento de tierras": [
    {
      id: 231,
      date: new Date("2024-01-15"),
      concept: "Renta anual parcela Finca El Retamar — contrato 5 años",
      amount: 1200,
      paymentMethod: "transferencia",
      invoiceNumber: "ARR-2024-001",
    },
    {
      id: 232,
      date: new Date("2024-04-01"),
      concept: "Renta trimestral Finca Los Olivos — 45 ha",
      amount: 800,
      paymentMethod: "transferencia",
      invoiceNumber: "ARR-2024-002",
    },
    {
      id: 233,
      date: new Date("2024-07-01"),
      concept: "Renta trimestral Finca Los Olivos — 45 ha",
      amount: 800,
      paymentMethod: "transferencia",
      invoiceNumber: "ARR-2024-003",
    },
    {
      id: 234,
      date: new Date("2024-10-01"),
      concept: "Renta trimestral Finca Los Olivos — 45 ha",
      amount: 800,
      paymentMethod: "transferencia",
      invoiceNumber: "ARR-2024-004",
    },
    {
      id: 235,
      date: new Date("2024-03-10"),
      concept: "Cesión de uso pastos invernales — ganadería vecinal",
      amount: 450,
      paymentMethod: "efectivo",
      invoiceNumber: null,
    },
    {
      id: 236,
      date: new Date("2024-09-20"),
      concept: "Arrendamiento nave almacén 500 m² — temporada cosecha",
      amount: 600,
      paymentMethod: "tarjeta",
      invoiceNumber: "ARR-2024-ALM01",
    },
  ],
  "Venta de leguminosas": [
    {
      id: 241,
      date: new Date("2024-06-18"),
      concept: "Venta garbanzos castellanos — mercado gourmet Madrid",
      amount: 980,
      paymentMethod: "transferencia",
      invoiceNumber: "VTA-2024-LG01",
    },
    {
      id: 242,
      date: new Date("2024-07-04"),
      concept: "Venta lentejas pardinas — Cooperativa Campo Charro",
      amount: 760,
      paymentMethod: "transferencia",
      invoiceNumber: "VTA-2024-LG02",
    },
    {
      id: 243,
      date: new Date("2024-07-22"),
      concept: "Venta habas secas para pienso — Piensos Norte",
      amount: 410,
      paymentMethod: "efectivo",
      invoiceNumber: null,
    },
    {
      id: 244,
      date: new Date("2024-10-10"),
      concept: "Venta veza para cubierta vegetal — Semillas Bio Ibérica",
      amount: 290,
      paymentMethod: "tarjeta",
      invoiceNumber: "VTA-2024-LG03",
    },
  ],
  "Servicios agronómicos": [
    {
      id: 251,
      date: new Date("2024-02-28"),
      concept: "Asesoría de abonado y plan de fertilización finca vecina",
      amount: 550,
      paymentMethod: "transferencia",
      invoiceNumber: "SRV-2024-001",
    },
    {
      id: 252,
      date: new Date("2024-04-15"),
      concept: "Servicio de laboreo y preparación de suelo — 80 ha",
      amount: 1100,
      paymentMethod: "transferencia",
      invoiceNumber: "SRV-2024-002",
    },
    {
      id: 253,
      date: new Date("2024-05-30"),
      concept: "Alquiler cosechadora + operario campaña cebada",
      amount: 1350,
      paymentMethod: "transferencia",
      invoiceNumber: "SRV-2024-003",
    },
    {
      id: 254,
      date: new Date("2024-08-12"),
      concept: "Servicio de pulverización fitosanitaria finca colindante",
      amount: 420,
      paymentMethod: "tarjeta",
      invoiceNumber: "SRV-2024-004",
    },
    {
      id: 255,
      date: new Date("2024-11-20"),
      concept: "Consultoría digitalización explotación agrícola",
      amount: 680,
      paymentMethod: "transferencia",
      invoiceNumber: "SRV-2024-005",
    },
  ],
  "Agroseguros / indemnizaciones": [
    {
      id: 261,
      date: new Date("2024-04-08"),
      concept: "Indemnización seguro cosecha trigo — granizo campaña 2023",
      amount: 2200,
      paymentMethod: "transferencia",
      invoiceNumber: "IND-2024-001",
    },
    {
      id: 262,
      date: new Date("2024-07-30"),
      concept: "Liquidación seguro helada tardía — cultivo de colza",
      amount: 870,
      paymentMethod: "transferencia",
      invoiceNumber: "IND-2024-002",
    },
    {
      id: 263,
      date: new Date("2024-09-15"),
      concept: "Cobro seguro sequía — reducción rendimiento maíz",
      amount: 1450,
      paymentMethod: "transferencia",
      invoiceNumber: "IND-2024-003",
    },
  ],
  "Otros ingresos": [
    {
      id: 271,
      date: new Date("2024-03-22"),
      concept: "Venta restos de poda y biomasa vegetal",
      amount: 180,
      paymentMethod: "efectivo",
      invoiceNumber: null,
    },
    {
      id: 272,
      date: new Date("2024-06-10"),
      concept: "Ingreso por instalación paneles solares en cubierta nave",
      amount: 490,
      paymentMethod: "transferencia",
      invoiceNumber: "OTR-2024-001",
    },
    {
      id: 273,
      date: new Date("2024-08-28"),
      concept: "Venta abono orgánico compostado — particulares",
      amount: 230,
      paymentMethod: "efectivo",
      invoiceNumber: null,
    },
    {
      id: 274,
      date: new Date("2024-10-18"),
      concept: "Alquiler espacio publicidad carretera N-420",
      amount: 350,
      paymentMethod: "tarjeta",
      invoiceNumber: "OTR-2024-002",
    },
    {
      id: 275,
      date: new Date("2024-12-05"),
      concept: "Venta maquinaria obsoleta — subasta online",
      amount: 620,
      paymentMethod: "transferencia",
      invoiceNumber: "OTR-2024-003",
    },
  ],
}

// ---------------------------------------------------------------------------
// Category icon map
// ---------------------------------------------------------------------------

const CATEGORY_ICONS: Record<string, IconComponent> = {
  "Venta de cereales": IconPlant2,
  "Venta de girasol": IconLeaf,
  "Subvenciones PAC": IconCoin,
  "Arrendamiento de tierras": IconBuildingStore,
  "Venta de leguminosas": IconDroplet,
  "Servicios agronómicos": IconTruck,
  "Agroseguros / indemnizaciones": IconMilk,
  "Otros ingresos": IconSettings,
}

// ---------------------------------------------------------------------------
// Thin wrapper
// ---------------------------------------------------------------------------

export function IncomeDrawer({
  open,
  onOpenChange,
  category,
  amount,
  percentage,
  color,
  transactions,
}: IncomeDrawerProps) {
  return (
    <CategoryDrawer
      open={open}
      onOpenChange={onOpenChange}
      category={category}
      amount={amount}
      percentage={percentage}
      color={color}
      variant="income"
      categoryIcons={CATEGORY_ICONS}
      dataByCategory={mockIncomesByCategory}
      transactions={transactions}
    />
  )
}
