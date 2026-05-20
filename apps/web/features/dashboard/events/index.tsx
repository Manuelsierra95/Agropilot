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
import { cn } from "@workspace/ui/lib/utils"
import { buttonVariants } from "@workspace/ui/components/button"

export function EventsList() {
  return (
    <Card className="col-span-1 flex h-full w-full flex-col overflow-hidden bg-background pb-0 ring-0">
      <CardHeader className="border-0 px-4">
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
      <CardContent className="flex-1 overflow-hidden bg-background p-0">
        <ScrollArea className="h-full px-4 py-0">
          <FarmEventList events={mockEvents} />
          <ScrollBar orientation="vertical" />
          <ScrollBar orientation="horizontal" className="sm:hidden" />
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex items-center justify-center border-0 bg-background px-4 py-0">
        <Link
          href="/dashboard/calendar"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "w-full gap-2 border-0 bg-muted-foreground/5 text-xs"
          )}
        >
          <span>Ver calendario completo</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </CardFooter>
    </Card>
  )
}
