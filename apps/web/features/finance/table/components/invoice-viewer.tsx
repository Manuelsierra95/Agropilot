import { IconDownload, IconFileInvoice } from "@tabler/icons-react"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"

export function InvoiceViewer({ invoiceNumber }: { invoiceNumber: string }) {
  const handleDownload = () => {
    toast.promise(new Promise((resolve) => setTimeout(resolve, 1200)), {
      loading: `Preparando factura ${invoiceNumber}…`,
      success: "Factura descargada",
      error: "Error al descargar",
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <IconFileInvoice className="size-4 text-muted-foreground" />
          Factura {invoiceNumber}
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={handleDownload}
        >
          <IconDownload className="size-4" />
          Descargar
        </Button>
      </div>
      {/* Invoice preview — replace with a real PDF viewer (e.g. react-pdf) */}
      <div className="flex min-h-52 flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/30 text-muted-foreground">
        <IconFileInvoice className="size-10 opacity-30" />
        <p className="text-xs">Vista previa de la factura</p>
        <p className="text-xs opacity-60">Nº {invoiceNumber}</p>
      </div>
    </div>
  )
}
