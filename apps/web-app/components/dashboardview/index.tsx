import { Map } from '@/components/dashboardview/map'
import { Metrics } from '@/components/dashboardview/metrics/index'
import { EventsList } from '@/components/dashboardview/todayevents'

export function Dashboard() {
  return (
    <div className="w-full h-full p-3 sm:p-4 md:p-6 mb-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-3 sm:gap-4">
        <Map />
        <EventsList />
        <Metrics />
      </div>
    </div>
  )
}
