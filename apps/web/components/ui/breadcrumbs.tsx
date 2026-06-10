"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import { IconSlash } from "@tabler/icons-react"
import { Fragment } from "react"
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs"

function BreadcrumbsPlaceholder() {
  return (
    <div
      className="h-4 w-28 max-w-full animate-pulse rounded-md bg-secondary"
      aria-busy="true"
      aria-label="Cargando navegación"
    />
  )
}

export function Breadcrumbs() {
  const items = useBreadcrumbs()

  if (items.length === 0) {
    return <BreadcrumbsPlaceholder />
  }

  return (
    <Breadcrumb className="min-w-0">
      <BreadcrumbList className="flex-nowrap">
        {items.map((item, index) => (
          <Fragment key={item.title}>
            {index < items.length - 1 ? (
              <>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href={item.link}>{item.title}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block">
                  <IconSlash />
                </BreadcrumbSeparator>
              </>
            ) : (
              <BreadcrumbItem>
                <BreadcrumbPage>{item.title}</BreadcrumbPage>
              </BreadcrumbItem>
            )}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
