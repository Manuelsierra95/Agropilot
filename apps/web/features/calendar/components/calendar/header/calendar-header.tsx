export default function CalendarHeader({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col justify-between gap-4 pb-4 lg:flex-row lg:items-center">
      {children}
    </div>
  )
}
