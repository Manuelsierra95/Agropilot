import { buttonVariants } from "@workspace/ui/components/button"
import { CardFooter } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export const LinkButton = ({
  text,
  href,
  className,
}: {
  text: string
  href: string
  className?: string
}) => {
  return (
    <CardFooter
      className={cn(
        "mt-auto flex items-center justify-center border-0 bg-background px-4",
        className
      )}
    >
      <Link
        href={href}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "w-full gap-2 border-0 bg-muted-foreground/5 text-xs"
        )}
      >
        <span>{text}</span>
        <ArrowRight className="size-3.5" />
      </Link>
    </CardFooter>
  )
}
