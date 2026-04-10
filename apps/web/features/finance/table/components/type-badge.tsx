import { Badge } from "@workspace/ui/components/badge"

export function TypeBadge({ type }: { type: "ingreso" | "gasto" }) {
  return (
    <Badge
      variant="outline"
      className={
        type === "ingreso"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
          : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
      }
    >
      {type === "ingreso" ? "↑ Ingreso" : "↓ Gasto"}
    </Badge>
  )
}
