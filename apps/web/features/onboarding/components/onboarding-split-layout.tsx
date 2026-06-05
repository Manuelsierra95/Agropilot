"use client"

import type { FormHTMLAttributes, ReactNode } from "react"
import { cn } from "@workspace/ui/lib/utils"

interface OnboardingSplitLayoutProps {
  children: ReactNode
  footer: ReactNode
  preview: ReactNode
  previewHeader?: ReactNode
  /** When "hidden", preview panel is omitted below the `sm` breakpoint (avoids empty mobile strip). */
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
  previewOnMobile = "stack",
  as = "div",
  formProps,
}: OnboardingSplitLayoutProps) {
  const hidePreviewOnMobile = previewOnMobile === "hidden"

  const content = (
    <>
      <div className="min-h-0 overflow-y-auto px-6 py-6 lg:col-start-1 lg:row-start-1 lg:px-10 lg:py-10">
        {children}
      </div>

      <div
        className={cn(
          "min-h-0 overflow-hidden border-t border-sidebar-border lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:border-t-0 lg:border-l",
          hidePreviewOnMobile && "hidden sm:block"
        )}
      >
        <PreviewPanel previewHeader={previewHeader} preview={preview} />
      </div>

      <div className="border-t border-sidebar-border bg-sidebar px-6 py-4 lg:col-start-1 lg:row-start-2 lg:px-10">
        {footer}
      </div>
    </>
  )

  const gridClassName = cn(
    layoutClassName,
    hidePreviewOnMobile &&
      "max-sm:grid-rows-[minmax(0,1fr)_auto] sm:grid-rows-[minmax(0,1fr)_minmax(0,12rem)_auto]"
  )

  if (as === "form") {
    return (
      <form {...formProps} className={cn(gridClassName, formProps?.className)}>
        {content}
      </form>
    )
  }

  return <div className={gridClassName}>{content}</div>
}
