import { IconFileInvoice, IconPlus } from "@tabler/icons-react"
import { Button } from "@workspace/ui/components/button"

export function EmptyState({
  onNewTransaction,
}: {
  onNewTransaction?: () => void
}) {
  return (
    <div className="mx-4 flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed bg-muted/20 px-6 py-16 text-center lg:mx-6">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <IconFileInvoice className="size-7 text-muted-foreground" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">Sin transacciones</p>
        <p className="max-w-xs text-xs text-muted-foreground">
          Todavía no hay ninguna transacción registrada. Pulsa el botón para
          añadir la primera.
        </p>
      </div>
      <Button size="sm" className="mt-1" onClick={onNewTransaction}>
        <IconPlus className="size-4" />
        Nueva transacción
      </Button>
    </div>
  )
}
