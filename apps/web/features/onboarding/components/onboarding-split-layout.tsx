"use client"

import { useState, type FormHTMLAttributes, type ReactNode } from "react"
import { ChevronsDownUpIcon, ChevronsUpDownIcon } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

/**
 * Two-column onboarding layout: form column (left) and live preview (right).
 *
 * Action placement convention across steps:
 * - **Inline (children):** add to a local collection or transform draft input
 *   (e.g. "Añadir a la lista", "Añadir parcela", "Procesar datos").
 * - **actions:** commit the current item or list before advancing
 *   (e.g. "Guardar parcela", "Enviar invitaciones"). On desktop, sits above the
 *   footer in the left column. On mobile, sits below the preview toggle/panel
 *   and above Continuar so users can review the preview and commit in one flow.
 * - **footer:** wizard navigation only — Continuar / Omitir. Do not mix save
 *   or add actions here.
 * - **previewActions (optional, inside preview):** commit on the assembled
 *   preview list ("carrito"). Prefer `actions` on the left for consistency and
 *   mobile visibility; use preview footer only when the preview is the primary
 *   confirmation surface on desktop.
 */
interface OnboardingSplitLayoutProps {
  /** Scrollable form and step content. Place inline add/process actions here. */
  children: ReactNode
  /** Wizard navigation only (Continuar, Omitir). */
  footer: ReactNode
  preview: ReactNode
  previewHeader?: ReactNode
  /** Commit actions pinned above `footer` on the left (save, send list, etc.). */
  actions?: ReactNode
  /** When "hidden", children manage their own scroll (e.g. nested ScrollArea). */
  contentOverflow?: "auto" | "hidden"
  /** When "hidden", preview stays collapsed by default on mobile until the user expands it. */
  previewOnMobile?: "stack" | "hidden"
  as?: "div" | "form"
  formProps?: FormHTMLAttributes<HTMLFormElement>
}

function PreviewPanel({
  previewHeader,
  preview,
}: {
  previewHeader?: ReactNode
  preview: ReactNode
}) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-sidebar-accent/40">
      {previewHeader ? (
        <div className="shrink-0 border-b border-sidebar-border px-6 py-4">
          {previewHeader}
        </div>
      ) : null}
      <div className="min-h-0 flex-1 overflow-hidden">{preview}</div>
    </div>
  )
}

const layoutClassName = cn(
  "grid h-full min-h-0 overflow-hidden",
  "grid-rows-[minmax(0,1fr)_minmax(0,12rem)_auto]",
  "lg:grid-cols-[minmax(0,36rem)_1fr] lg:grid-rows-[minmax(0,1fr)_auto]"
)

export function OnboardingSplitLayout({
  children,
  footer,
  preview,
  previewHeader,
  actions,
  contentOverflow = "auto",
  previewOnMobile = "stack",
  as = "div",
  formProps,
}: OnboardingSplitLayoutProps) {
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false)

  const gridClassName = cn(
    layoutClassName,
    !actions &&
      !isMobilePreviewOpen &&
      "max-lg:grid-rows-[minmax(0,1fr)_auto_auto]",
    !actions &&
      isMobilePreviewOpen &&
      "max-lg:grid-rows-[0fr_minmax(0,1fr)_auto]",
    actions &&
      !isMobilePreviewOpen &&
      "max-lg:grid-rows-[minmax(0,1fr)_auto_auto_auto]",
    actions &&
      isMobilePreviewOpen &&
      "max-lg:grid-rows-[0fr_minmax(0,1fr)_auto_auto]"
  )

  const actionsBarClassName =
    "shrink-0 border-t border-sidebar-border bg-sidebar px-6 py-4 lg:px-10"

  const mainColumn = (
    <div
      className={cn(
        "row-start-1 flex min-h-0 flex-col overflow-hidden lg:col-start-1 lg:row-start-1",
        isMobilePreviewOpen && "max-lg:min-h-0 max-lg:overflow-hidden"
      )}
    >
      <div
        className={cn(
          "min-h-0 flex-1 px-6 pt-6 lg:px-10 lg:pt-10",
          contentOverflow === "auto"
            ? "overflow-y-auto pb-4"
            : "overflow-hidden pb-0"
        )}
      >
        {children}
      </div>
      {actions ? (
        <div className={cn(actionsBarClassName, "hidden lg:block")}>
          {actions}
        </div>
      ) : null}
    </div>
  )

  const mobileActionsColumn = actions ? (
    <div className={cn(actionsBarClassName, "row-start-3 lg:hidden")}>
      {actions}
    </div>
  ) : null

  const previewColumn = (
    <div
      className={cn(
        "row-start-2 flex min-h-0 flex-col overflow-hidden border-t border-sidebar-border lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:border-t-0 lg:border-l",
        isMobilePreviewOpen && "max-lg:min-h-0 max-lg:border-t-0"
      )}
    >
      <Button
        type="button"
        variant="ghost"
        className="h-10 w-full shrink-0 justify-center gap-2 rounded-none border-b text-muted-foreground lg:hidden"
        onClick={() => setIsMobilePreviewOpen((open) => !open)}
        aria-expanded={isMobilePreviewOpen}
        aria-controls="onboarding-mobile-preview"
      >
        {isMobilePreviewOpen ? (
          <ChevronsDownUpIcon className="size-4" aria-hidden />
        ) : (
          <ChevronsUpDownIcon className="size-4" aria-hidden />
        )}
        <span className="text-sm font-medium">Vista previa</span>
      </Button>
      <div
        id="onboarding-mobile-preview"
        className={cn(
          "min-h-0 flex-1 overflow-hidden",
          !isMobilePreviewOpen && "max-lg:hidden"
        )}
      >
        <PreviewPanel previewHeader={previewHeader} preview={preview} />
      </div>
    </div>
  )

  const footerColumn = (
    <div
      className={cn(
        "border-t border-sidebar-border bg-sidebar px-6 py-4 lg:col-start-1 lg:row-start-2 lg:px-10",
        actions ? "row-start-4" : "row-start-3"
      )}
    >
      {footer}
    </div>
  )

  if (as === "form") {
    const { className: formClassName, ...formRest } = formProps ?? {}

    return (
      <div className={gridClassName}>
        <form {...formRest} className={cn("contents", formClassName)}>
          {mainColumn}
          {mobileActionsColumn}
          {footerColumn}
        </form>
        {previewColumn}
      </div>
    )
  }

  return (
    <div className={gridClassName}>
      {mainColumn}
      {previewColumn}
      {mobileActionsColumn}
      {footerColumn}
    </div>
  )
}
