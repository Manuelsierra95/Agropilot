import { EventList, type FarmEvent } from "@workspace/ui/components/event-list"

type FarmEventListProps = {
  events: FarmEvent[]
}

export function FarmEventList({ events }: FarmEventListProps) {
  return <EventList events={events} />
}
