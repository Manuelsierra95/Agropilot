export const DashboardPageContainer = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <main
      className={`@container/main flex flex-1 flex-col px-2 py-2 md:px-6 ${className || ""}`}
    >
      {children}
    </main>
  )
}
