import type { CalendarProps } from "@workspace/web/features/calendar/components/calendar/calendar-types"
import CalendarHeader from "@workspace/web/features/calendar/components/calendar/header/calendar-header"
import CalendarBody from "@workspace/web/features/calendar/body/calendar-body"
import CalendarHeaderActions from "@workspace/web/features/calendar/components/calendar/header/actions/calendar-header-actions"
import CalendarHeaderDate from "@workspace/web/features/calendar/components/calendar/header/date/calendar-header-date"
import CalendarHeaderActionsMode from "@workspace/web/features/calendar/components/calendar/header/actions/calendar-header-actions-mode"
import CalendarHeaderActionsAdd from "@workspace/web/features/calendar/components/calendar/header/actions/calendar-header-actions-add"
import CalendarProvider from "@workspace/web/features/calendar/components/calendar/calendar-provider"

export default function Calendar({
  tasks,
  setTasks,
  mode,
  setMode,
  date,
  setDate,
  calendarIconIsToday = true,
  forecast,
}: CalendarProps) {
  return (
    <CalendarProvider
      tasks={tasks}
      setTasks={setTasks}
      mode={mode}
      setMode={setMode}
      date={date}
      setDate={setDate}
      calendarIconIsToday={calendarIconIsToday}
      forecast={forecast}
    >
      <div className="flex h-full min-h-0 flex-col border-border/30">
        <CalendarHeader>
          <CalendarHeaderDate />
          <CalendarHeaderActions>
            <CalendarHeaderActionsMode />
            <CalendarHeaderActionsAdd />
          </CalendarHeaderActions>
        </CalendarHeader>
        <CalendarBody />
      </div>
    </CalendarProvider>
  )
}
