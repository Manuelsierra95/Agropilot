import { Button, buttonVariants } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { ArrowRightIcon } from "lucide-react"
import type { Transaction } from "@/store/mockTransactions"
import Link from "next/link"

type TransactionSnapshot = Omit<
  Pick<
    Transaction,
    "type" | "category" | "amount" | "paymentMethod" | "invoiceNumber" | "date"
  >,
  "date"
> & {
  date: string | Date
  parcelName?: string
}

function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value)
}

const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
})

const shortDateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
})

const typeLabels: Record<Transaction["type"], string> = {
  ingreso: "Ingreso",
  gasto: "Gasto",
}

const paymentLabels: Record<Transaction["paymentMethod"], string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  tarjeta: "Tarjeta",
  cheque: "Cheque",
  otro: "Otro",
}

function formatSignedAmount(type: Transaction["type"], amount: number) {
  const formatted = currencyFormatter.format(Math.abs(amount))
  if (amount === 0) return formatted
  return type === "ingreso" ? `+${formatted}` : `-${formatted}`
}

function toneClass(type: Transaction["type"]) {
  return type === "ingreso"
    ? "text-(--primary-income)"
    : "text-(--primary-expense)"
}

function getVisibleTransactions(data: TransactionSnapshot[]) {
  return [...data]
    .sort((a, b) => toDate(b.date).getTime() - toDate(a.date).getTime())
    .slice(0, 6)
}

interface RecentTransactionsProps {
  data: TransactionSnapshot[]
  className?: string
  showParcelColumn?: boolean
}

export function RecentTransactions({
  data,
  className,
  showParcelColumn = false,
}: RecentTransactionsProps) {
  const visible = getVisibleTransactions(data)

  return (
    <Card className={cn("relative w-full bg-background ring-0", className)}>
      <CardHeader>
        <CardTitle className="text-balance">Transacciones</CardTitle>
        <CardDescription className="text-pretty">
          Últimas transacciones realizadas.
        </CardDescription>
      </CardHeader>
      <CardContent className="mask-b-from-50% mask-b-to-100% p-0 pb-2">
        <Table className="border-t">
          <TableCaption className="sr-only">
            Ultimas transacciones con metodo y fecha.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6" scope="col">
                Movimiento
              </TableHead>
              {showParcelColumn ? (
                <TableHead scope="col">Parcela</TableHead>
              ) : null}
              <TableHead scope="col">Metodo</TableHead>
              <TableHead className="text-end tabular-nums" scope="col">
                Importe
              </TableHead>
              <TableHead className="pr-6 text-end" scope="col">
                Fecha
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow>
                <TableCell
                  className="px-6 py-6 text-center text-xs text-muted-foreground"
                  colSpan={showParcelColumn ? 5 : 4}
                >
                  Sin transacciones recientes.
                </TableCell>
              </TableRow>
            ) : (
              visible.map((tx, index) => (
                <TableRow
                  className="hover:bg-transparent"
                  key={
                    tx.invoiceNumber ??
                    `${tx.parcelName ?? "org"}-${toDate(tx.date).toISOString()}-${index}`
                  }
                >
                  <TableCell className="max-w-[260px] truncate pl-6">
                    <div className="flex items-center gap-2">
                      <Badge className="h-5 px-2 text-[10px]" variant="outline">
                        {typeLabels[tx.type] ?? tx.type}
                      </Badge>
                      <span className="min-w-0 truncate text-xs font-medium">
                        {tx.category}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {tx.invoiceNumber
                        ? `Factura ${tx.invoiceNumber}`
                        : "Sin factura"}
                    </p>
                  </TableCell>
                  {showParcelColumn ? (
                    <TableCell className="max-w-[140px] truncate text-xs text-muted-foreground">
                      {tx.parcelName ?? "—"}
                    </TableCell>
                  ) : null}
                  <TableCell className="text-xs text-muted-foreground">
                    {paymentLabels[tx.paymentMethod] ?? tx.paymentMethod}
                  </TableCell>
                  <TableCell
                    className={`text-end text-xs tabular-nums ${toneClass(tx.type)}`}
                  >
                    {formatSignedAmount(tx.type, tx.amount)}
                  </TableCell>
                  <TableCell className="pr-6 text-end text-xs text-muted-foreground">
                    {shortDateFormatter.format(toDate(tx.date))}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      <div className="absolute inset-x-0 bottom-0 flex h-1/5 items-center justify-center bg-background mask-t-from-30%">
        <Link
          href={"/dashboard/transactions"}
          className={cn(buttonVariants({ variant: "ghost" }), "relative")}
        >
          Ver todas las transacciones
          <ArrowRightIcon aria-hidden="true" />
        </Link>
      </div>
    </Card>
  )
}
