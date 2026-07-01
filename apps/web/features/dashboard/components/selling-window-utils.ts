export type WindowSignal = "favorable" | "neutral" | "unfavorable"

export function getSellingWindowSignal(margin: number): WindowSignal {
  if (margin >= 0.8) return "favorable"
  if (margin >= 0.3) return "neutral"
  return "unfavorable"
}

export const SELLING_WINDOW_SIGNAL_CONFIG = {
  favorable: {
    label: "Favorable",
    color: "text-(--primary-income)",
    badgeVariant: "default" as const,
    bg: "bg-(--primary-income)/10",
  },
  neutral: {
    label: "Ajustado",
    color: "text-amber-500",
    badgeVariant: "secondary" as const,
    bg: "bg-amber-500/10",
  },
  unfavorable: {
    label: "Desfavorable",
    color: "text-(--primary-expense)",
    badgeVariant: "destructive" as const,
    bg: "bg-(--primary-expense)/10",
  },
} as const
