import {
  TreePine,
  Circle,
  Home,
  Calendar,
  DollarSign,
  Cpu,
  BookOpen,
  Zap,
  Settings2,
  CheckCircle,
  Clock,
  User,
  Building,
  CreditCard,
  Map,
  Leaf,
  Sprout,
  Flower2,
  LucideIcon,
} from "lucide-react"

const ICON_MAP: Record<string, LucideIcon> = {
  TreePine,
  Circle,
  Home,
  Calendar,
  DollarSign,
  Cpu,
  BookOpen,
  Zap,
  Settings2,
  CheckCircle,
  Clock,
  User,
  Building,
  CreditCard,
  Map,
  Leaf,
  Sprout,
  Flower2,
}

export function getIcon(
  name: string,
  fallback: LucideIcon = Circle
): LucideIcon {
  return ICON_MAP[name] ?? fallback
}
