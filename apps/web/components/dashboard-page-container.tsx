import { cn } from "@workspace/ui/lib/utils"

export const DashboardPageContainer = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <main
      className={cn(
        "@container/main flex flex-1 flex-col px-4 py-4",
        className
      )}
    >
      {children}
    </main>
  )
}
