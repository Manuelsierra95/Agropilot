import { PageContainer } from "@/components/ui/page-container"
import { calendarMockData } from "@/lib/calendar-mock"
import { CalendarClient } from "@/features/calendar/components/calendar/calendar-client"
import { GradientSeparator } from "@/components/ui/gradient-separator"
import {
  TimeWeatherCard,
  mockForecast,
  mockWeatherData,
} from "@/features/calendar/components/calendar/sidecards/time-weather-card"
import { ActiveAlertsCard } from "./components/active-alerts-card"
import { CampaignTimeline } from "./components/campaign-timeline"
import { KpisCard } from "./components/kpis-card"
import { RecommendationsCard } from "./components/recommendations-card"
import { Kanban } from "./components/kanban"

export default function Calendar() {
  return (
    <PageContainer className="grid grid-cols-[1fr_auto_1fr_auto_1fr] grid-rows-[minmax(0,300px)_auto_minmax(0,1120px)_auto_auto] gap-4">
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
      <div className="col-span-3 row-start-3 overflow-auto">
        <CalendarClient
          initialEvents={calendarMockData}
          forecast={mockForecast}
        />
      </div>

      <GradientSeparator
        orientation="vertical"
        className="col-start-4 row-start-3"
      />

      <div className="col-start-5 row-start-3">
        <Kanban events={calendarMockData} />
      </div>

      {/* 📊 Timeline */}
      <GradientSeparator
        orientation="horizontal"
        className="col-span-5 col-start-1 row-start-4"
      />

      <div className="col-span-5 col-start-1 row-start-5">
        <CampaignTimeline />
      </div>
    </PageContainer>
  )
}
