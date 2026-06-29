import { toast } from "sonner"
import { useIsMobile } from "@workspace/ui/hooks/use-mobile"
import { Button } from "@workspace/ui/components/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@workspace/ui/components/drawer"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Separator } from "@workspace/ui/components/separator"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet"
import { Textarea } from "@workspace/ui/components/textarea"

import type { Transaction } from "@workspace/web/features/finance/table/types"
import { CATEGORIES, PAYMENT_METHOD_LABELS } from "@workspace/web/features/finance/table/constants"
import { formatCurrency, formatDate, toSafeDate } from "@workspace/web/features/finance/table/helpers"
import { TypeBadge } from "@workspace/web/features/finance/table/components/type-badge"
import { InvoiceViewer } from "@workspace/web/features/finance/table/components/invoice-viewer"

export function TableCellViewer({ item }: { item: Transaction }) {
  const isMobile = useIsMobile()

  const trigger = (
    <Button variant="link" className="w-fit px-0 text-left text-foreground">
      {item.concept}
    </Button>
  )

  const body = (
    <div className="flex flex-col gap-5 overflow-y-auto px-4 text-sm">
      {/* Amount highlight */}
      <div
        className={`rounded-lg px-4 py-3 ${
          item.type === "ingreso"
            ? "bg-emerald-50 dark:bg-emerald-950/40"
            : "bg-red-50 dark:bg-red-950/40"
        }`}
      >
        <p className="text-xs text-muted-foreground">Importe</p>
        <p
          className={`text-2xl font-semibold ${
            item.type === "ingreso"
              ? "text-emerald-700 dark:text-emerald-400"
              : "text-red-700 dark:text-red-400"
          }`}
        >
          {item.type === "gasto" ? "−" : "+"}
          {formatCurrency(item.amount)}
        </p>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg border p-4 text-xs">
        <div>
          <p className="text-muted-foreground">Método de pago</p>
          <p className="font-medium">
            {item.paymentMethod
              ? PAYMENT_METHOD_LABELS[item.paymentMethod]
              : "—"}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Nº Factura</p>
          <p className="font-medium">{item.invoiceNumber ?? "—"}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Fecha</p>
          <p className="font-medium">{formatDate(item.date)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Parcela</p>
          <p className="font-medium">#{item.parcelId}</p>
        </div>
      </div>

      {/* Description */}
      {item.description && (
        <div>
          <p className="mb-1 text-xs text-muted-foreground">Descripción</p>
          <p className="rounded-lg border bg-muted/30 px-3 py-2 text-xs leading-relaxed">
            {item.description}
          </p>
        </div>
      )}

      {/* Invoice viewer */}
      {item.invoiceNumber && (
        <>
          <Separator />
          <InvoiceViewer invoiceNumber={item.invoiceNumber} />
        </>
      )}

      <Separator />

      {/* Edit form */}
      <form className="flex flex-col gap-4 pb-2">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Editar transacción
        </p>
        <div className="flex flex-col gap-2">
          <Label htmlFor="concept">Concepto</Label>
          <Input id="concept" defaultValue={item.concept} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="type">Tipo</Label>
            <Select defaultValue={item.type}>
              <SelectTrigger id="type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ingreso">Ingreso</SelectItem>
                <SelectItem value="gasto">Gasto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="category">Categoría</Label>
            <Select defaultValue={item.category}>
              <SelectTrigger id="category" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="amount">Importe (€)</Label>
            <Input
              id="amount"
              type="number"
              min={0}
              step={0.01}
              defaultValue={item.amount}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="paymentMethod">Método de pago</Label>
            <Select defaultValue={item.paymentMethod ?? undefined}>
              <SelectTrigger id="paymentMethod" className="w-full">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transferencia">Transferencia</SelectItem>
                <SelectItem value="tarjeta">Tarjeta</SelectItem>
                <SelectItem value="efectivo">Efectivo</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              type="date"
              defaultValue={
                toSafeDate(item.date)?.toISOString().split("T")[0] ?? ""
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="invoiceNumber">Nº Factura</Label>
            <Input
              id="invoiceNumber"
              defaultValue={item.invoiceNumber ?? ""}
              placeholder="Opcional"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            defaultValue={item.description ?? ""}
            placeholder="Notas adicionales…"
            rows={3}
          />
        </div>
      </form>
    </div>
  )

  const footer = (
    <>
      <Button
        onClick={() =>
          toast.promise(
            new Promise((resolve) => setTimeout(resolve, 1000)),
            {
              loading: "Guardando cambios…",
              success: "Transacción actualizada",
              error: "Error al guardar",
            }
          )
        }
      >
        Guardar cambios
      </Button>
    </>
  )

  if (isMobile) {
    return (
      <Drawer direction="bottom">
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent className="min-w-fit">
          <DrawerHeader className="gap-1">
            <div className="flex items-start justify-between gap-2">
              <DrawerTitle className="leading-tight">{item.concept}</DrawerTitle>
              <TypeBadge type={item.type} />
            </div>
            <DrawerDescription>
              {item.category} · Parcela #{item.parcelId} · {formatDate(item.date)}
            </DrawerDescription>
          </DrawerHeader>
          {body}
          <DrawerFooter>
            {footer}
            <DrawerClose asChild>
              <Button variant="outline">Cerrar</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="right" className="min-w-fit">
        <SheetHeader className="gap-1">
          <div className="flex items-start justify-between gap-2">
            <SheetTitle className="leading-tight">{item.concept}</SheetTitle>
            <TypeBadge type={item.type} />
          </div>
          <SheetDescription>
            {item.category} · Parcela #{item.parcelId} · {formatDate(item.date)}
          </SheetDescription>
        </SheetHeader>
        {body}
        <SheetFooter>
          {footer}
          <SheetClose asChild>
            <Button variant="outline">Cerrar</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
