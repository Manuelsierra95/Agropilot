'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { TrendingUp, TrendingDown, Wallet, DollarSign } from 'lucide-react'

export interface FinancesSummary {
  totalIngresos: number
  totalGastos: number
  balance: number
  balanceEsteMes: number
  ingresosEsteMes: number
  gastosEsteMes: number
}

interface FinancesSummaryCardsProps {
  summary: FinancesSummary
}

export default function FinancesSummaryCards({
  summary,
}: FinancesSummaryCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const cards = [
    {
      title: 'Ingresos Totales',
      amount: summary.totalIngresos,
      icon: TrendingUp,
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Gastos Totales',
      amount: summary.totalGastos,
      icon: TrendingDown,
      iconColor: 'text-rose-600',
    },
    {
      title: 'Balance Total',
      amount: summary.balance,
      icon: Wallet,
      iconColor: summary.balance >= 0 ? 'text-blue-600' : 'text-orange-600',
    },
    {
      title: 'Balance Este Mes',
      amount: summary.balanceEsteMes,
      icon: DollarSign,
      iconColor:
        summary.balanceEsteMes >= 0 ? 'text-violet-600' : 'text-amber-600',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card key={index} className="hover:bg-accent/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${card.iconColor}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(card.amount)}
              </div>
              {index === 3 && (
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span className="text-emerald-600">↑</span>
                    <span>{formatCurrency(summary.ingresosEsteMes)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-rose-600">↓</span>
                    <span>{formatCurrency(summary.gastosEsteMes)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
