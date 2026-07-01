"use client"

import { IconCoin, IconPlant2, IconSettings } from "@tabler/icons-react"
import {
  CategoryDrawer,
  type CategoryTransaction,
  type IconComponent,
} from "@workspace/web/features/finance/components/drawer/components/category-drawer"

export interface IncomeDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: string
  amount: number
  percentage: string
  color: string
  transactions?: CategoryTransaction[]
}

const CATEGORY_ICONS: Record<string, IconComponent> = {
  "Venta de cosecha": IconPlant2,
  Subvenciones: IconCoin,
  Otros: IconSettings,
}

export function IncomeDrawer({
  open,
  onOpenChange,
  category,
  amount,
  percentage,
  color,
  transactions = [],
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
      transactions={transactions}
    />
  )
}
