import { Button } from "@workspace/ui/components/button"
import { Plus } from "lucide-react"
import { useCalendarContext } from "@workspace/web/features/calendar/components/calendar/calendar-context"

export default function CalendarHeaderActionsAdd() {
  const { setNewEventDialogOpen } = useCalendarContext()
  return (
    <Button
      className="flex items-center gap-2 border-0 bg-muted-foreground/5 py-4 text-primary"
      onClick={() => setNewEventDialogOpen(true)}
      variant="outline"
    >
      <Plus />
      Add Event
    </Button>
  )
}
