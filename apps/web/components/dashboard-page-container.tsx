export const DashboardPageContainer = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <main
      className={`@container/main flex flex-1 flex-col pb-4 ${className || ""}`}
    >
      {children}
    </main>
  )
}
