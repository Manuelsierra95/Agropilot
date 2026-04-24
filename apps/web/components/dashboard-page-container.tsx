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
        "@container/main flex flex-1 flex-col px-2 py-2 md:px-6",
        className
      )}
    >
      {children}
    </main>
  )
}
