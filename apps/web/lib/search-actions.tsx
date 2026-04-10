import type { Action } from "kbar"
import { navigationData } from "@/lib/navigation-data"

export function createActionsFromNavData(): Action[] {
  const actions: Action[] = []

  navigationData.navMain.forEach((item) => {
    actions.push({
      id: item.title.toLowerCase().replace(/\s+/g, "-"),
      name: item.title,
      icon: item.icon,
      section: "Navigation",
      perform: () => (window.location.href = item.url),
    })

    item.items?.forEach((subItem) => {
      actions.push({
        id: `${item.title.toLowerCase()}-${subItem.title.toLowerCase()}`.replace(
          /\s+/g,
          "-"
        ),
        name: subItem.title,
        parent: item.title.toLowerCase().replace(/\s+/g, "-"),
        perform: () => (window.location.href = subItem.url),
      })
    })
  })

  navigationData.projects.forEach((project) => {
    actions.push({
      id: `project-${project.name.toLowerCase().replace(/\s+/g, "-")}`,
      name: project.name,
      icon: project.icon,
      section: "Projects",
      perform: () => (window.location.href = project.url),
    })
  })

  navigationData.teams.forEach((team) => {
    actions.push({
      id: `team-${team.name.toLowerCase().replace(/\s+/g, "-")}`,
      name: team.name,
      subtitle: team.plan,
      icon: team.icon,
      section: "Teams",
    })
  })

  return actions
}
