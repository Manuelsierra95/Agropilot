"use client"

import { DashboardPageContainer } from "@/components/dashboard-page-container"
import { useState } from "react"
import CalendarComponent from "@/features/calendar/calendar"
import { CalendarEvent, Mode } from "@/features/calendar/calendar-types"
import { calendarMockData } from "@/lib/calendar-mock"
import { WeeklyEventsCard } from "@/features/calendar/sidecards/weekly-events-card"
import { TimeWeatherCard } from "@/features/calendar/sidecards/time-weather-card"

export default function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>(calendarMockData)
  const [mode, setMode] = useState<Mode>("month")
  const [date, setDate] = useState<Date>(new Date())

  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.date)
    return (
      eventDate.getFullYear() === date.getFullYear() &&
      eventDate.getMonth() === date.getMonth()
    )
  })

  const handleEventClick = (event: CalendarEvent) => {
    // Aquí podrías abrir un modal con los detalles del evento o algo similar
    alert(
      `Evento: ${event.title}\nFecha: ${new Date(event.date).toLocaleString()}`
    )
  }

  return (
    <DashboardPageContainer className="grid grid-cols-1 gap-8 px-4 pt-4 md:grid-cols-3 md:px-6 md:pt-0">
      <div className="col-span-1 flex h-full flex-col gap-4">
        <TimeWeatherCard />
        <WeeklyEventsCard
          events={filteredEvents}
          onEventClick={handleEventClick}
        />
      </div>
      <div className="col-span-2">
        <CalendarComponent
          events={events}
          setEvents={setEvents}
          mode={mode}
          setMode={setMode}
          date={date}
          setDate={setDate}
        />
      </div>
    </DashboardPageContainer>
  )
}
