import { DashboardPageContainer } from "@/components/dashboard-page-container"
import { calendarMockData } from "@/lib/calendar-mock"
import { CalendarClient } from "@/features/calendar/calendar-client"
import {
  TimeWeatherCard,
  mockForecast,
  mockWeatherData,
} from "@/features/calendar/sidecards/time-weather-card"

export default function Calendar() {
  return (
    <DashboardPageContainer className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(18rem,24rem)_minmax(0,1fr)] lg:items-start">
      <TimeWeatherCard weather={mockWeatherData} forecast={mockForecast} />
      <CalendarClient initialEvents={calendarMockData} />
    </DashboardPageContainer>
  )
}
