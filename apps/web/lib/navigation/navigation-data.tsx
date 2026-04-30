import { LucideIcon } from "lucide-react"
import {
  Cpu,
  BookOpen,
  Home,
  Calendar,
  DollarSign,
  TreePine,
  Circle,
  CheckCircle,
  Clock,
  Zap,
  Settings2Icon,
} from "lucide-react"

export type NavigationParcel = {
  name: string
  crop: string
  icon: LucideIcon | string
}

export type NavigationNavSubItem = {
  title: string
  url: string
  icon?: LucideIcon
}

export type ModuleStatus = "available" | "coming_soon" | "beta"

export const ModuleStatusIcons = {
  available: CheckCircle,
  coming_soon: Clock,
  beta: Zap,
}

export type NavigationNavItem = {
  title: string
  url: string
  icon: LucideIcon
}

export type NavigationNavModulesItem = NavigationNavItem & {
  status: ModuleStatus
  isActive: boolean
  isLocked: boolean
  items?: NavigationNavSubItem[]
  purchaseUrl?: string
}

export type NavigationUser = {
  name: string
  email: string
  avatar: string
}

export type NavigationData = {
  user: NavigationUser
  parcels: NavigationParcel[]
  navMain: NavigationNavItem[]
  modules: NavigationNavModulesItem[]
  settings: NavigationNavItem[]
}

export const navigationData: NavigationData = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  parcels: [
    { name: "Alivos Cazorla", crop: "Olivos", icon: "TreePine" },
    { name: "Almendros Sierra", crop: "Almendros", icon: "TreePine" },
    { name: "Cortijo Peal", crop: "Tomates", icon: "Circle" },
  ],
  navMain: [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Calendar", url: "/dashboard/calendar", icon: Calendar },
    { title: "Finance", url: "/dashboard/finance", icon: DollarSign },
    { title: "Parcel", url: "/dashboard/parcel", icon: TreePine },
  ],
  modules: [
    {
      title: "Analisis con IA",
      url: "/modules/ai-analysis",
      icon: Cpu,
      status: "available",
      isActive: true,
      isLocked: false,
      items: [
        { title: "Análisis de suelo", url: "/modules/ai-analysis/soil" },
        { title: "Análisis de plagas", url: "/modules/ai-analysis/pests" },
        { title: "Análisis de riego", url: "/modules/ai-analysis/irrigation" },
      ],
    },
    {
      title: "Cuaderno de campo",
      url: "/modules/field-notebook",
      icon: BookOpen,
      status: "available",
      isActive: true,
      isLocked: true,
      purchaseUrl: "https://www.agropilot.com/pricing",
      items: [
        {
          title: "Diario de campo",
          url: "/modules/field-notebook/daily-journal",
        },
        {
          title: "Registro de tratamientos",
          url: "/modules/field-notebook/treatments",
        },
        {
          title: "Registro de riego",
          url: "/modules/field-notebook/irrigation",
        },
      ],
    },
    {
      title: "Automatizaciones",
      url: "/modules/automations",
      icon: Zap,
      status: "coming_soon",
      isActive: false,
      isLocked: false,
      items: [
        {
          title: "Alertas de riego",
          url: "/modules/automations/irrigation-alerts",
        },
        { title: "Alertas de plagas", url: "/modules/automations/pest-alerts" },
        {
          title: "Riego automático",
          url: "/modules/automations/irrigation-automation",
        },
      ],
    },
  ],
  settings: [
    {
      title: "Profile",
      url: "/dashboard/settings/profile",
      icon: Settings2Icon,
    },
    {
      title: "Organization",
      url: "/dashboard/settings/organization",
      icon: Settings2Icon,
    },
    {
      title: "Billing",
      url: "/dashboard/settings/billing",
      icon: Settings2Icon,
    },
  ],
}
