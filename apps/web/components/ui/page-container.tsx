import { cn } from "@workspace/ui/lib/utils"

export const PageContainer = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <main className={cn("@container/main flex flex-1 flex-col p-3 sm:p-4 lg:p-6", className)}>
      {children}
    </main>
  )
}
