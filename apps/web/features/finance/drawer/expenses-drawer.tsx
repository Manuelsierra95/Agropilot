"use client"

import {
  IconDroplet,
  IconFlame,
  IconLeaf,
  IconSettings,
  IconTractor,
  IconUsers,
  IconWind,
} from "@tabler/icons-react"
import {
  CategoryDrawer,
  type CategoryTransaction,
  type IconComponent,
} from "@workspace/web/features/finance/drawer/components/category-drawer"

export interface ExpensesDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: string
  amount: number
  percentage: string
  color: string
  transactions?: CategoryTransaction[]
}

const CATEGORY_ICONS: Record<string, IconComponent> = {
  Riego: IconDroplet,
  Fertilización: IconLeaf,
  Tratamiento: IconWind,
  Combustible: IconFlame,
  "Mano de obra": IconUsers,
  Maquinaria: IconTractor,
  Cosecha: IconLeaf,
  Otros: IconSettings,
}

export function ExpensesDrawer({
  open,
  onOpenChange,
  category,
  amount,
  percentage,
  color,
  transactions = [],
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
      transactions={transactions}
    />
  )
}
