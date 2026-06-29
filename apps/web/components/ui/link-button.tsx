import { buttonVariants } from "@workspace/ui/components/button"
import { CardFooter } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import { ArrowRight } from "lucide-react"
import { PreservedLink } from "@workspace/web/components/preserved-link"
import type { ScopeKey } from "@workspace/web/lib/navigation/scope"

export const LinkButton = ({
  text,
  href,
  include,
  className,
}: {
  text: string
  href: string
  include?: ScopeKey[]
  className?: string
}) => {
  return (
    <CardFooter
      className={cn(
        "mt-auto flex items-center justify-center border-0 bg-background px-4",
        className
      )}
    >
      <PreservedLink
        href={href}
        include={include}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "w-full gap-2 border-0 bg-muted-foreground/5 text-xs"
        )}
      >
        <span>{text}</span>
        <ArrowRight className="size-3.5" />
      </PreservedLink>
    </CardFooter>
  )
}
