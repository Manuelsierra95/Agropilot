import Link from "next/link"
import {
  ArrowRight,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCcw,
  ShoppingCart,
  Zap,
  Building2,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area"
import { buttonVariants } from "@workspace/ui/components/button"

// ─── Types ────────────────────────────────────────────────────────────────────

type TransactionType = "income" | "expense" | "transfer" | "refund"

interface Transaction {
  id: string
  type: TransactionType
  description: string
  category: string
  amount: number
  currency: string
  date: string
  status: "completed" | "pending" | "failed"
}

// ─── Mock data ─────────────────────────────────────────────────────────────────

const transactions: Transaction[] = [
  {
    id: "txn_001",
    type: "income",
    description: "Pago de cliente",
    category: "Ventas",
    amount: 4500.0,
    currency: "EUR",
    date: "Hace 2 minutos",
    status: "completed",
  },
  {
    id: "txn_002",
    type: "expense",
    description: "Adobe Creative Cloud",
    category: "Suscripciones",
    amount: -59.99,
    currency: "EUR",
    date: "Hace 1 hora",
    status: "completed",
  },
  {
    id: "txn_003",
    type: "transfer",
    description: "Transferencia a cuenta ahorro",
    category: "Ahorro",
    amount: -1200.0,
    currency: "EUR",
    date: "Hace 3 horas",
    status: "completed",
  },
  {
    id: "txn_004",
    type: "expense",
    description: "Factura eléctrica",
    category: "Servicios",
    amount: -128.4,
    currency: "EUR",
    date: "Ayer",
    status: "pending",
  },
  {
    id: "txn_005",
    type: "refund",
    description: "Reembolso Amazon",
    category: "Compras",
    amount: 34.95,
    currency: "EUR",
    date: "Hace 2 días",
    status: "completed",
  },
  {
    id: "txn_006",
    type: "income",
    description: "Dividendos trimestrales",
    category: "Inversiones",
    amount: 812.5,
    currency: "EUR",
    date: "Hace 3 días",
    status: "completed",
  },
  {
    id: "txn_007",
    type: "income",
    description: "Dividendos trimestrales",
    category: "Inversiones",
    amount: 812.5,
    currency: "EUR",
    date: "Hace 3 días",
    status: "completed",
  },
  {
    id: "txn_008",
    type: "income",
    description: "Dividendos trimestrales",
    category: "Inversiones",
    amount: 812.5,
    currency: "EUR",
    date: "Hace 3 días",
    status: "completed",
  },
  {
    id: "txn_009",
    type: "income",
    description: "Dividendos trimestrales",
    category: "Inversiones",
    amount: 812.5,
    currency: "EUR",
    date: "Hace 3 días",
    status: "completed",
  },
  {
    id: "txn_010",
    type: "income",
    description: "Dividendos trimestrales",
    category: "Inversiones",
    amount: 812.5,
    currency: "EUR",
    date: "Hace 3 días",
    status: "completed",
  },
  {
    id: "txn_011",
    type: "income",
    description: "Dividendos trimestrales",
    category: "Inversiones",
    amount: 812.5,
    currency: "EUR",
    date: "Hace 3 días",
    status: "completed",
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const typeConfig: Record<
  TransactionType,
  { icon: React.ElementType; iconBg: string; iconColor: string }
> = {
  income: {
    icon: ArrowDownLeft,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
  },
  expense: {
    icon: ShoppingCart,
    iconBg: "bg-rose-500/10",
    iconColor: "text-rose-500",
  },
  transfer: {
    icon: RefreshCcw,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  refund: {
    icon: ArrowUpRight,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
  },
}

const statusConfig: Record<
  Transaction["status"],
  {
    label: string
    variant: "default" | "secondary" | "destructive" | "outline"
  }
> = {
  completed: { label: "Completada", variant: "secondary" },
  pending: { label: "Pendiente", variant: "outline" },
  failed: { label: "Fallida", variant: "destructive" },
}

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    signDisplay: "always",
  }).format(amount)
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FinanceOverview() {
  return (
    <Card className="col-span-1 flex h-full w-full flex-col gap-0 bg-background pb-0 ring-0">
      <CardHeader className="border-b border-border/60 px-4">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-medium">
            Últimas transacciones
          </CardTitle>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Actividad financiera reciente de tu cuenta
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
          <div className="divide-y divide-border/60">
            {transactions.map((txn) => {
              const { icon: Icon, iconBg, iconColor } = typeConfig[txn.type]
              const { label, variant } = statusConfig[txn.status]
              const isPositive = txn.amount > 0

              return (
                <div
                  key={txn.id}
                  className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/40"
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "flex size-9 flex-none items-center justify-center rounded-full",
                      iconBg
                    )}
                  >
                    <Icon className={cn("size-4", iconColor)} />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm leading-none font-medium">
                      {txn.description}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {txn.category}
                      </span>
                      <span className="text-xs text-muted-foreground/50">
                        ·
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {txn.date}
                      </span>
                    </div>
                  </div>

                  {/* Amount + Status */}
                  <div className="flex flex-none flex-col items-end gap-1.5">
                    <span
                      className={cn(
                        "text-sm font-semibold tabular-nums",
                        isPositive
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-foreground"
                      )}
                    >
                      {formatAmount(txn.amount, txn.currency)}
                    </span>
                    <Badge
                      variant={variant}
                      className="h-4 px-1.5 py-0 text-[10px] font-medium"
                    >
                      {label}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
          <ScrollBar orientation="vertical" />
          <ScrollBar orientation="horizontal" className="sm:hidden" />
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex items-center justify-center border-0 bg-background px-4 py-2">
        <Link
          href="/dashboard/finance"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "w-full gap-2 border-0 bg-muted-foreground/5 text-xs"
          )}
        >
          <span>Ver todas las transacciones</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </CardFooter>
    </Card>
  )
}
