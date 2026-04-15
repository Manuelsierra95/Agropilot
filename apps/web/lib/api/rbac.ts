import { redirect } from "next/navigation"
import { api } from "@/lib/api"

export function handleRbacStatus(response: Response) {
  if (response.status === 401) {
    redirect("/auth/login")
  }

  if (response.status === 403) {
    redirect("/forbidden")
  }

  if (!response.ok) {
    throw new Error(`Unexpected API error (${response.status})`)
  }
}

export async function getProtectedProfile() {
  const response = await api.example.profile()
  handleRbacStatus(response)

  return response.json()
}

export async function getAdminData(currentRole: "admin" | "member") {
  if (currentRole !== "admin") {
    redirect("/forbidden")
  }

  const response = await api.example.admin()
  handleRbacStatus(response)

  return response.json()
}
