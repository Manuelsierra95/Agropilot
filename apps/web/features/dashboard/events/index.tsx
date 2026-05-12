"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area"
import { ArrowRight } from "lucide-react"
import { mockEvents } from "@/store/mockEvents"
import { FarmEventList } from "./event-list"
import Link from "next/link"

export function EventsList() {
  return (
    <Card className="col-span-1 flex h-full w-full flex-col gap-0 pb-0">
      <CardHeader className="px-4 pb-4">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-medium">
            Próximos Eventos
          </CardTitle>
          <Badge variant="secondary" className="h-5 w-5 rounded-full text-xs">
            {mockEvents.length}
          </Badge>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Haz click en un evento para ver más detalles.
        </CardDescription>
      </CardHeader>
      <CardContent className="m-0 flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full w-full">
          <div className="px-4 pb-2">
            <FarmEventList events={mockEvents} />
          </div>
          <ScrollBar orientation="vertical" />
          <ScrollBar orientation="horizontal" className="sm:hidden" />
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex justify-center bg-card py-2">
        <Link
          href="/dashboard/calendar"
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <span>Ver calendario completo</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </CardFooter>
    </Card>
  )
}
