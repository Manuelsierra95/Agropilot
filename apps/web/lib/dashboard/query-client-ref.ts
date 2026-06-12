import type { QueryClient } from "@tanstack/react-query"

let dashboardQueryClient: QueryClient | null = null

export function setDashboardQueryClient(client: QueryClient) {
  dashboardQueryClient = client
}

export function getDashboardQueryClient(): QueryClient | null {
  return dashboardQueryClient
}
