import { DashboardPageContainer } from "@/components/dashboard-page-container"
import { calendarMockData } from "@/lib/calendar-mock"
import { CalendarClient } from "@/features/calendar/components/calendar/calendar-client"
import { GradientSeparator } from "@/components/gradient-separator"
import {
  TimeWeatherCard,
  mockForecast,
  mockWeatherData,
} from "@/features/calendar/components/calendar/sidecards/time-weather-card"
import { ActiveAlertsCard } from "./components/active-alerts-card"
import { CropSeasonTimeline } from "./components/crop-season-timeline"
import { KpisCard } from "./components/kpis-card"
import { RecommendationsCard } from "./components/recommendations-card"
import { Kanban } from "./components/kanban"

export default function Calendar() {
  return (
    <DashboardPageContainer className="grid grid-cols-[1fr_auto_1fr_auto_1fr] grid-rows-[300px_auto_1fr_auto_auto] gap-4">
      {/* 🔴 TOP: DECISION LAYER */}
      <div className="col-start-1 row-start-1">
        <ActiveAlertsCard />
      </div>

      <GradientSeparator
        orientation="vertical"
        className="col-start-2 row-start-1"
      />

      <div className="col-start-3 row-start-1">
        <RecommendationsCard />
      </div>

      <GradientSeparator
        orientation="vertical"
        className="col-start-4 row-start-1"
      />

      <div className="col-start-5 row-start-1">
        <KpisCard events={calendarMockData} />
      </div>

      <GradientSeparator
        orientation="horizontal"
        className="col-span-5 col-start-1 row-start-2"
      />

      {/* 🗓️ MAIN */}
      <div className="col-span-3 row-start-3 h-fit max-h-[1120px] min-h-0">
        <CalendarClient
          initialEvents={calendarMockData}
          forecast={mockForecast}
        />
      </div>

      <GradientSeparator
        orientation="vertical"
        className="col-start-4 row-start-3"
      />

      <div className="col-start-5 row-start-3 flex h-full max-h-[1120px] min-h-0">
        <Kanban events={calendarMockData} />
      </div>

      {/* 📊 Timeline */}
      <GradientSeparator
        orientation="horizontal"
        className="col-span-5 col-start-1 row-start-4"
      />

      <div className="col-span-5 col-start-1 row-start-5">
        <CropSeasonTimeline />
      </div>
    </DashboardPageContainer>
  )
}
