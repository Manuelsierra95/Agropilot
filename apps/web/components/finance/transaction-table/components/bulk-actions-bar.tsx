import {
  IconAlertTriangle,
  IconFileExport,
  IconTrash,
} from "@tabler/icons-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog"
import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"

interface BulkActionsBarProps {
  selectedCount: number
  onDelete: () => void
  onExport: () => void
}

export function BulkActionsBar({
  selectedCount,
  onDelete,
  onExport,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border bg-background px-4 py-3 shadow-lg ring-1 shadow-black/10 ring-border">
      <span className="text-sm font-medium text-muted-foreground">
        {selectedCount}{" "}
        {selectedCount === 1 ? "fila seleccionada" : "filas seleccionadas"}
      </span>
      <Separator orientation="vertical" className="h-5" />
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={onExport}
      >
        <IconFileExport className="size-4" />
        Exportar
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm" className="gap-1.5">
            <IconTrash className="size-4" />
            Eliminar
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <IconAlertTriangle className="size-5 text-destructive" />
              Confirmar eliminación
            </AlertDialogTitle>
            <AlertDialogDescription>
              Vas a eliminar{" "}
              <span className="font-semibold text-foreground">
                {selectedCount}{" "}
                {selectedCount === 1 ? "transacción" : "transacciones"}
              </span>
              . Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
              onClick={onDelete}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
